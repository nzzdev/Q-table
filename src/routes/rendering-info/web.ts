// These lines make "require" available.
// Todo comment.
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import { dirname } from 'path';
import { fileURLToPath } from 'url';

// Setup svelte environment.
require('svelte/register');

import type { Request, ServerRoute } from '@hapi/hapi';
import type { AvailabilityResponseObject, QTableConfig, RenderingInfo, WebPayload, WebContextObject  } from '../../interfaces';

// Require tools.
import Ajv from 'ajv';
import Boom from '@hapi/boom';
import fs from 'fs';
import UglifyJS from 'uglify-js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Directories.
const rootDir = __dirname + '/../../../';
const distDir = rootDir + 'dist/';

const resourcesDir = rootDir + 'resources/';
const viewsDir = distDir + 'components/';
const stylesDir = distDir + 'styles/';

// @ts-ignore
import tableTemplate2 from '../../components/Table.js';
// console.log('aa', tableTemplate2);

const styleHashMap = require(`${stylesDir}/hashMap.json`);

import getExactPixelWidth from '../../helpers/toolRuntimeConfig.js';

import { getDataWithoutHeaderRow, formatTableData } from '../../helpers/data.js';
import { getMinibar } from '../../helpers/minibars.js';
import { getColorColumn } from '../../helpers/colorColumn.js';
import * as renderingInfoScripts from '../../helpers/renderingInfoScript.js';
import { getFootnotes } from '../../helpers/footnotes.js';

// POSTed item will be validated against given schema
// hence we fetch the JSON schema...
const schemaString = JSON.parse(
  fs.readFileSync(resourcesDir + 'schema.json', {
    encoding: 'utf-8',
  })
);

const ajv = new Ajv();
const validate = ajv.compile(schemaString);

function validateAgainstSchema(item: QTableConfig) {
  if (validate(item)) {
    return item;
  } else {
    throw Boom.badRequest(JSON.stringify(validate.errors));
  }
}

const route: ServerRoute = {
  method: 'POST',
  path: '/rendering-info/web',
  options: {
    validate: {
      options: {
        allowUnknown: true,
      },
      payload: async (payload: WebPayload) => {
        if (
          typeof payload !== 'object' ||
          typeof payload.item !== 'object' ||
          typeof payload.toolRuntimeConfig !== 'object'
        ) {
          throw Boom.badRequest('The given payload for this route is not correct.');
        }

        await validateAgainstSchema(payload.item);
      },
    },
  },
  handler: async function (request: Request) {
    const renderingInfo: RenderingInfo = {
      polyfills: ['Promise'],
      stylesheets: [{
        name: styleHashMap['q-table'],
      }],
      scripts: [],
      markup: '',
    };

    const payload = request.payload as WebPayload;

    // Extract table configurations.
    const config = payload.item;
    const toolRuntimeConfig = payload.toolRuntimeConfig;
    const options = config.options;

    let width = getExactPixelWidth(toolRuntimeConfig);

    const itemDataCopy = config.data.table.slice(0); // get unformated copy of data for minibars

    const dataWithoutHeaderRow = getDataWithoutHeaderRow(itemDataCopy);
    const footnotes = getFootnotes(config.data.metaData, options.hideTableHeader);

    const minibarsAvailable = await areMinibarsAvailable(request, config);
    const colorColumnAvailable = await isColorColumnAvailable(request, config);

    const tableData = formatTableData(config.data.table, footnotes, options);

    const minibar = getMinibar(minibarsAvailable, options, itemDataCopy);
    const colorColumn = getColorColumn(colorColumnAvailable, options.colorColumn, dataWithoutHeaderRow, width || 0);

    const context: WebContextObject = {
      item: config, // To make renderingInfoScripts working. refactor later.
      config,
      tableData,
      minibar,
      footnotes,
      colorColumn,
      numberOfRows: config.data.table.length - 1, // do not count the header
      displayOptions: payload.toolRuntimeConfig.displayOptions || {},
      noInteraction: payload.toolRuntimeConfig.noInteraction || false,
      id: `q_table_${request.query._id}_${Math.floor(
        Math.random() * 100000
      )}`.replace(/-/g, ''),
      width,
      initWithCardLayout: false,
      numberOfRowsToHide: undefined,
    };

    // if we have a width and cardLayoutIfSmall is true, we will initWithCardLayout
    if (
      context.width &&
      context.width < 400 &&
      config.options.cardLayoutIfSmall
    ) {
      context.initWithCardLayout = true;
    } else if (config.options.cardLayout) {
      context.initWithCardLayout = true;
    }

    // calculate the number of rows to hide

    // if we init with card layout, we need to have minimum of 6 rows to hide all but 3 of them
    // this calculation here is not correct if we didn't get the width, as it doesn't take small/wide layout into account
    // but it's good enough to already apply display: none; in the markup to not use the complete height until the stylesheets/scripts are loaded
    if (context.initWithCardLayout && context.numberOfRows >= 6) {
      context.numberOfRowsToHide = context.numberOfRows - 3; // show 3 initially
    } else if (context.numberOfRows >= 15) {
      // if we init without cardLayout, we hide rows if we have more than 15
      context.numberOfRowsToHide = context.numberOfRows - 10; // show 10 initially
    }

    // if we have toolRuntimeConfig.noInteraction, we do not hide rows because showing them is not possible
    if (toolRuntimeConfig.noInteraction) {
      context.numberOfRowsToHide = undefined;
    }

    try {
      renderingInfo.markup = (tableTemplate2 as any).render(context).html
    } catch (ex) {
      console.log('Failed rendering html', ex);
    }


    // the scripts need to know if we are confident that the numberOfRowsToHide is correct
    // it's only valid if we had a fixed width given in toolRuntimeConfig, otherwise we reset it here to be calculated by the scripts again
    if (context.width === undefined) {
      context.numberOfRowsToHide = undefined;
    }

    let possibleToHaveToHideRows = false;

    // if we show cards, we hide if more or equal than 6
    if (config.options.cardLayout && context.numberOfRows >= 6) {
      possibleToHaveToHideRows = true;
    }
    // if we have cards for small, we hide if more or equal than 6
    if (
      config.options.cardLayoutIfSmall && // we have cardLayoutIfSmall
      (context.width === undefined || context.width < 400) && // width is unknown or below 400px
      context.numberOfRows >= 6 // more than 6 rows
    ) {
      possibleToHaveToHideRows = true;
    }
    // if we have more than 15 rows, we probably have to hide rows
    if (context.numberOfRows >= 15) {
      possibleToHaveToHideRows = true;
    }

    if (toolRuntimeConfig.noInteraction) {
      possibleToHaveToHideRows = false;
    }

    // if we are going to add any script, we want the default script first
    if (
      (config.options.cardLayout === false &&
        config.options.cardLayoutIfSmall === true) ||
      possibleToHaveToHideRows ||
      context.minibar !== null ||
      context.colorColumn !== null
    ) {
      renderingInfo.scripts.push({
        content: renderingInfoScripts.getDefaultScript(context),
      });
    }

    // if we have cardLayoutIfSmall, we need to measure the width to set the class
    // not needed if we have cardLayout all the time
    if (
      config.options.cardLayout === false &&
      config.options.cardLayoutIfSmall === true
    ) {
      renderingInfo.scripts.push({
        content: renderingInfoScripts.getCardLayoutScript(context),
      });
    }

    if (possibleToHaveToHideRows) {
      renderingInfo.scripts.push({
        content: renderingInfoScripts.getShowMoreButtonScript(context),
      });
    }

    if (
      context.noInteraction !== true &&
      config.options.showTableSearch === true
    ) {
      renderingInfo.scripts.push({
        content: renderingInfoScripts.getSearchFormInputScript(context),
      });
    }

    if (context.minibar !== null) {
      renderingInfo.scripts.push({
        content: renderingInfoScripts.getMinibarsScript(context),
      });
    }

    if (context.colorColumn !== null) {
      renderingInfo.scripts.push({
        content: renderingInfoScripts.getColorColumnScript(context),
      });
    }

    // minify the scripts
    for (let script of renderingInfo.scripts) {
      script.content = UglifyJS.minify(script.content).code;
    }

    return renderingInfo;
  },
};

async function areMinibarsAvailable(request: Request, config: QTableConfig): Promise<boolean> {
  const response = await request.server.inject({
    url: '/option-availability/selectedColumnMinibar',
    method: 'POST',
    payload: { item: config },
  });

  const result = response.result as AvailabilityResponseObject | undefined;
  if (result) {
    return result.available;
  } else {
    console.log('Error receiving result for /option-availability/selectedColumnMinibar', result);
    return false;
  }
}

async function isColorColumnAvailable(request: Request, config: QTableConfig): Promise<boolean> {
  const response = await request.server.inject({
    url: '/option-availability/selectedColorColumn',
    method: 'POST',
    payload: { item: config },
  });

  const result = response.result as AvailabilityResponseObject | undefined;
  if (result) {
    return result.available;
  } else {
    console.log('Error receiving result for /option-availability/selectedColorColumn', result);
    return false;
  }
}

export default route;
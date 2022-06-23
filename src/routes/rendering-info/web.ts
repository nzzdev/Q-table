// These lines make "require" available.
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import fs from 'fs';
import Ajv from 'ajv';
import Boom from '@hapi/boom';
import UglifyJS from 'uglify-js';
import { FRONT_END_SCRIPT } from '../../enums';
import type { Request, ServerRoute } from '@hapi/hapi';
import type {
  AvailabilityResponseObject,
  QTableConfig,
  RenderingInfo,
  WebPayload,
  WebContextObject,
  QTableDataFormatted,
} from '../../interfaces';

// File only exists in dist folder.
const styleHashMap = require('./styles/hashMap.json');

import getExactPixelWidth from '../../helpers/toolRuntimeConfig.js';

import { getDataWithoutHeaderRow, formatTableData } from '../../helpers/data.js';
import { getMinibar } from '../../helpers/minibars.js';
import { ColorColumn, getColorColumn } from '../../helpers/colorColumn.js';
import * as renderingInfoScripts from '../../helpers/renderingInfoScript.js';
import { getFootnotes } from '../../helpers/footnotes.js';

import schemaString from '../../../resources/schema.json';

const ajv = new Ajv();
const validate = ajv.compile(schemaString);

function validateAgainstSchema(item: QTableConfig) {
  if (validate(item)) {
    return item;
  } else {
    throw Boom.badRequest(JSON.stringify(validate.errors));
  }
}

let addedDefaultScript = false;

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
    // Need to reset flags.
    addedDefaultScript = false;

    const id = createId(request);
    let qtableCompiledScript = '';

    try {
      qtableCompiledScript = fs.readFileSync('dist/Q-Table.js', {
        encoding: 'utf-8',
      });
    } catch(ex) {
      console.log('ex', ex);
    }

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

    let tableData: QTableDataFormatted[][] = [];

    try {
      tableData = formatTableData(config.data.table, footnotes, options);
    } catch (e) {
      console.error('Execption during formatting table data', e);
    }

    const minibar = getMinibar(minibarsAvailable, options, itemDataCopy);
    let colorColumn: ColorColumn | null = null;

    try {
      colorColumn = getColorColumn(colorColumnAvailable, options.colorColumn, dataWithoutHeaderRow, width || 0);
    } catch (e) {
      console.error('Execption during creating colorColumn', e);
    }

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
      id,
      width,
      initWithCardLayout: false,
      numberOfRowsToHide: undefined,
    };

    // if we have a width and cardLayoutIfSmall is true, we will initWithCardLayout
    if (context.width && context.width < 400 && config.options.cardLayoutIfSmall) {
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

    // The scripts need to know if we are confident that the numberOfRowsToHide is correct
    // it's only valid if we had a fixed width given in toolRuntimeConfig, otherwise
    // we reset it here to be calculated by the scripts again.
    if (context.width === undefined) {
      context.numberOfRowsToHide = undefined;
    }

    let possibleToHaveToHideRows = false;

    // if we show cards, we hide if more or equal than 6
    if (options.cardLayout && context.numberOfRows >= 6) {
      possibleToHaveToHideRows = true;
    }

    // if we have cards for small, we hide if more or equal than 6
    if (
      options.cardLayoutIfSmall && // we have cardLayoutIfSmall
      (context.width === undefined || context.width < 400) && // width is unknown or below 400px
      context.numberOfRows >= 6 // more than 6 rows
    ) {
      possibleToHaveToHideRows = true;
    }
    // if we have more than 15 rows, we probably have to hide rows
    if (context.numberOfRows >= 15) {
      possibleToHaveToHideRows = true;
    }

    // need to look into this.
    if (toolRuntimeConfig.noInteraction) {
      possibleToHaveToHideRows = false;
    }

    // if we have cardLayoutIfSmall, we need to measure the width
    // to set the class not needed if we have cardLayout all the time.
    // if (options.cardLayout === false && options.cardLayoutIfSmall === true) {
    //   addScript(FRONT_END_SCRIPT.CARD_LAYOUT, renderingInfo, context);
    // }

    // if (possibleToHaveToHideRows) {
    //   addScript(FRONT_END_SCRIPT.SHOW_MORE_BTN, renderingInfo, context);
    // }

    // if (context.noInteraction !== true && config.options.showTableSearch === true) {
    //   addScript(FRONT_END_SCRIPT.SEARCH_FORM_INPUT, renderingInfo, context);
    // }

    // if (context.minibar !== null) {
    //   addScript(FRONT_END_SCRIPT.MINIBAR, renderingInfo, context);
    // }

    // if (context.colorColumn !== null) {
    //   addScript(FRONT_END_SCRIPT.COLOR_COLUMN, renderingInfo, context);
    // }

    const renderingInfo: RenderingInfo = {
      polyfills: ['Promise'],
      stylesheets: [{
        name: styleHashMap['q-table'],
      }],
      scripts: [
        {
          content: qtableCompiledScript,
        },
        {
          content: `
          (function () {
            var target = document.querySelector('#${id}_container');
            target.innerHTML = "";
            var props = ${JSON.stringify(context)};
            new window.q_table({
              "target": target,
              "props": props
            })
          })();`,
        },
      ],
      markup: `<div id="${id}_container" class="q-your-tool-container" />`,
    };

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

function addScript(id: FRONT_END_SCRIPT, renderingInfo: RenderingInfo, context: WebContextObject): void {
  let script = '';

  // If we are going to add any script, we want the default script first.
  if (addedDefaultScript === false) {
    // Must set this to true before calling add script or infinite loop.
    addedDefaultScript = true;

    addScript(FRONT_END_SCRIPT.DEFAULT, renderingInfo, context);
  }

  switch(id) {
    case FRONT_END_SCRIPT.CARD_LAYOUT:
      script = renderingInfoScripts.getCardLayoutScript(context);
      break;

    case FRONT_END_SCRIPT.COLOR_COLUMN:
      script = renderingInfoScripts.getColorColumnScript(context);
      break;

    case FRONT_END_SCRIPT.MINIBAR:
      script = renderingInfoScripts.getMinibarsScript(context);
      break;

    case FRONT_END_SCRIPT.SEARCH_FORM_INPUT:
      script = renderingInfoScripts.getSearchFormInputScript(context);
      break;

    case FRONT_END_SCRIPT.SHOW_MORE_BTN:
      script = renderingInfoScripts.getShowMoreButtonScript(context);
      break;

    default:
      script = renderingInfoScripts.getDefaultScript(context);
      console.log('aaa');
      break;
  }

  const minified = UglifyJS.minify(script).code;

  renderingInfo.scripts.push({
    content: minified
  });
}

function createId(request: Request): string {
  return `q_table_${request.query._id}_${Math.floor(Math.random() * 100000)}`.replace(/-/g, '');
}

export default route;

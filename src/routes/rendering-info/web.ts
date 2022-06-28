// These lines make "require" available.
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import fs from 'fs';
import Ajv from 'ajv';
import Boom from '@hapi/boom';
import type { Request, ServerRoute } from '@hapi/hapi';

import type { ColorColumn } from '../../helpers/colorColumn.js';

import type {
  AvailabilityResponseObject,
  QTableConfig,
  RenderingInfo,
  WebPayload,
  QTableSvelteProperties,
  QTableDataFormatted,
  ToolRuntimeConfig,
  QTableConfigOptions,
  DisplayOptions,
} from '../../interfaces';

// File only exists in dist folder.
const styleHashMap = require('./styles/hashMap.json');

import getExactPixelWidth from '../../helpers/toolRuntimeConfig.js';

import { getDataWithoutHeaderRow, formatTableData } from '../../helpers/data.js';
import { getMinibar } from '../../helpers/minibars.js';
import { getColorColumn } from '../../helpers/colorColumn.js';
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
    const id = createId(request);
    let qtableCompiledScript = '';

    try {
      qtableCompiledScript = fs.readFileSync('dist/Q-Table.js', {
        encoding: 'utf-8',
      });
    } catch (e) {
      console.log('Failed  reading compiled Q-Table code', e);
    }

    const payload = request.payload as WebPayload;

    // Extract table configurations.
    const config = payload.item;
    const toolRuntimeConfig = payload.toolRuntimeConfig;
    const displayOptions = toolRuntimeConfig.displayOptions || {} as DisplayOptions;
    const options = config.options;

    let colorColumn: ColorColumn | null = null;
    const width = getExactPixelWidth(toolRuntimeConfig);

    const itemDataCopy = config.data.table.slice(0); // get unformated copy of data for minibars
    const dataWithoutHeaderRow = getDataWithoutHeaderRow(itemDataCopy);
    const dataLength = dataWithoutHeaderRow.length;
    const footnotes = getFootnotes(config.data.metaData, options.hideTableHeader);

    const minibarsAvailable = await areMinibarsAvailable(request, config);
    const minibar = getMinibar(minibarsAvailable, options, itemDataCopy);

    const colorColumnAvailable = await isColorColumnAvailable(request, config);
    const initWithCardLayout = getInitWithCardLayoutFlag(width, options);
    const pageSize = calculatePageSize(dataLength, initWithCardLayout, options, toolRuntimeConfig);


    let tableData: QTableDataFormatted[][] = [];

    try {
      tableData = formatTableData(config.data.table, footnotes, options);
    } catch (e) {
      console.error('Execption during formatting table data', e);
    }

    try {
      colorColumn = getColorColumn(colorColumnAvailable, options.colorColumn, dataWithoutHeaderRow, width || 0);
    } catch (e) {
      console.error('Execption during creating colorColumn', e);
    }

    const props: QTableSvelteProperties = {
      item: config, // To make renderingInfoScripts working. refactor later.
      config,
      tableHead: tableData[0],
      rows: tableData.slice(1),
      minibar,
      footnotes,
      colorColumn,
      numberOfRows: dataLength, // do not count the header
      displayOptions: displayOptions,
      noInteraction: payload.toolRuntimeConfig.noInteraction || false,
      id,
      width,
      initWithCardLayout,
      usePagination: options.usePagination || false,
      pageSize,
      hideTableHeader: options.hideTableHeader,
    };

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
            var props = ${JSON.stringify(props)};
            new window.q_table({
              "target": target,
              "props": {
                componentConfiguration: props
              }
            })
          })();`,
        },
      ],
      markup: `<div id="${id}_container" class="q-table-container" />`,
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

function createId(request: Request): string {
  return `q_table_${request.query._id}_${Math.floor(Math.random() * 100000)}`.replace(/-/g, '');
}


function calculatePageSize(totalAmountOfRows: number, initWithCardLayout: boolean, options: QTableConfigOptions, toolRuntimeConfig: ToolRuntimeConfig): number {
  const { pageSize } = options;

  // if we have noInteraction, we do not hide rows because showing them is not possible.
  if (toolRuntimeConfig.noInteraction === true) {
    return totalAmountOfRows;
  }

  // Use the user provided pagesize above
  // auto calculated ones.
  if (typeof pageSize === 'number') {
    return pageSize;
  }

  if (initWithCardLayout && totalAmountOfRows >= 6) {
    return 3;
  }

  if (totalAmountOfRows >= 15) {
    return 10;
  }

  return totalAmountOfRows;
}

function getInitWithCardLayoutFlag(width: number | undefined, options: QTableConfigOptions): boolean {
  const { cardLayout, cardLayoutIfSmall } = options;

  if (cardLayout === true) {
    return true;
  }

  if (typeof width === 'number' && width < 400 && cardLayoutIfSmall === true) {
    return true;
  }

  return false;
}

export default route;

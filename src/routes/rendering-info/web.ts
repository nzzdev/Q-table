import Ajv from 'ajv';
import Boom from '@hapi/boom';
import getExactPixelWidth from '@helpers/toolRuntimeConfig.js';
import { getColorColumn } from '@helpers/colorColumn.js';
import { getDataWithoutHeaderRow, formatTableData } from '@helpers/data.js';
import { getFootnotes } from '@helpers/footnotes.js';
import { getMinibar } from '@helpers/minibars.js';
import { readFileSync } from 'fs';

// Don't use aliased import here. For some reasom it will not
// removed during the build then and the app will crash.
import schemaString from '../../../resources/schema.json';
import type { Request, ServerRoute } from '@hapi/hapi';
import type { ColorColumn } from '@helpers/colorColumn.js';
import type { ProcessedTableData} from '@helpers/data';

import type {
  AvailabilityResponseObject,
  DisplayOptions,
  QTableConfig,
  QTableConfigOptions,
  QTableSvelteProperties,
  RenderingInfo,
  StyleHashMap,
  ToolRuntimeConfig,
  WebPayload,
  Cell,
} from '@src/interfaces';

const ajv = new Ajv({
  strict: false,
});
const validate = ajv.compile(schemaString);

const route: ServerRoute = {
  method: 'POST',
  path: '/rendering-info/web',
  options: {
    validate: {
      options: {
        allowUnknown: true,
      },
      payload: payload => {
        const payloadTyped = payload as WebPayload;
        const item = payloadTyped.item;
        const toolRuntimeConfig = payloadTyped.toolRuntimeConfig;

        if (typeof payloadTyped !== 'object' || typeof item !== 'object' || typeof toolRuntimeConfig !== 'object') {
          throw Boom.badRequest('The given payload for this route is not correct.');
        }

        if (validate(item)) {
          return new Promise(resolve => {
            resolve(item);
          });
        } else {
          throw Boom.badRequest(JSON.stringify(validate.errors));
        }
      },
    },
  },
  handler: async function (request: Request) {
    const id = createId(request);
    let qtableCompiledScript = '';
    let styleHashMap: StyleHashMap | null = null;

    try {
      qtableCompiledScript = readFileSync('dist/Q-Table.js', {
        encoding: 'utf-8',
      });
    } catch (e) {
      console.log('Failed reading compiled Q-Table code - ', e);
    }

    try {
      const rawString = readFileSync('dist/styles/hashMap.json', {
        encoding: 'utf-8',
      });

      styleHashMap = JSON.parse(rawString) as StyleHashMap;
    } catch (e) {
      console.log('Failed reading compiled style hashmap - ', e);
    }

    const payload = request.orig.payload as WebPayload;

    // Extract table configurations.
    const config = payload.item;



    const toolRuntimeConfig = payload.toolRuntimeConfig || {};
    const displayOptions = toolRuntimeConfig.displayOptions || ({} as DisplayOptions);
    const options = config.options;
    let colorColumn: ColorColumn | null = null;
    const width = getExactPixelWidth(toolRuntimeConfig);
    const dataWithoutHeaderRow = getDataWithoutHeaderRow(config.data.table);
    const dataLength = dataWithoutHeaderRow.length;

    let tableData: ProcessedTableData = {
      rows: [],
      header: [],
      columns: [],
    };

    // Process options.
    const footnoteObj = getFootnotes(config.data.metaData.cells, options.hideTableHeader);
    const initWithCardLayout = getInitWithCardLayoutFlag(width, options);
    const pageSize = calculatePageSize(dataLength, initWithCardLayout, options, toolRuntimeConfig);

    const minibarsAvailable = await areMinibarsAvailable(request, config);
    const colorColumnAvailable = await isColorColumnAvailable(request, config);

    // Most important part.
    // Processing raw data into a format we can use in the front-end.
    try {
      tableData = formatTableData(config.data.table, footnoteObj.footnoteCellMap, options);
    } catch (e) {
      // TODO Add logging to Kibana
      console.error('Exception during formatting table data - ', e);

    }

    // Need processed in order to setup the minibar.
    const minibar = getMinibar(minibarsAvailable, options.minibar, tableData.columns as Cell<number>[][]);


    try {
      colorColumn = getColorColumn(colorColumnAvailable, options.colorColumn, dataWithoutHeaderRow, width || 0);
    } catch (e) {
      // TODO Add logging to Kibana.
      console.error('Exception during creating colorColumn - ', e);
    }

    const props: QTableSvelteProperties = {
      item: config, // To make renderingInfoScripts working. refactor later.
      config,
      tableHead: tableData.header,
      rows: tableData.rows,
      minibar,
      footnotes: footnoteObj.footnotes,
      colorColumn,
      numberOfRows: dataLength, // do not count the header
      displayOptions: displayOptions,
      noInteraction: payload.toolRuntimeConfig.noInteraction || false,
      id,
      width,
      initWithCardLayout,
      pageSize,
      hideTableHeader: options.hideTableHeader,
      frozenRowKey: options.frozenRowKey
    };

    const renderingInfo: RenderingInfo = {
      polyfills: ['Promise'],
      stylesheets: [],
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
      markup: `<div id="${id}_container" class="q-table-container"></div>`,
    };

    if (styleHashMap !== null) {
      renderingInfo.stylesheets.push({
        name: styleHashMap['q-table'],
      });
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

  if (typeof width === 'number' && width <= 400 && cardLayoutIfSmall === true) {
    return true;
  }

  return false;
}

export default route;

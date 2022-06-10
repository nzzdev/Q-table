import { ColorColumn } from './helpers/colorColumn';
import { StructuredFootnote } from './helpers/footnotes';
import { Minibar } from './helpers/minibars';

export const enum LABEL_LEGEND_ID {
  MEDIAN = 'median',
  AVERAGE = 'average',
  NO_LABEL = 'noLabel',
}

export interface WebPayload {
  item: QTableConfig,
  toolRuntimeConfig: ToolRuntimeConfig,
}

export type BucketType = 'ckmeans' | 'quantile' | 'equal' | 'custom';
export type ColorColumnType = 'numerical' | 'categorical';
export type QTableDataRaw = (string | null)[][];

export interface ColorOverwrites {
  textColor: string,
  color: string,
  position: number,
}

export interface ColorColumnSettings {
  colorColumnType: ColorColumnType,
  numericalOptions: {
    labelLegend: LABEL_LEGEND_ID,
    bucketType: BucketType,
    numberBuckets: number,
    scale: string,
    colorScheme: string,
    colorOverwrites: ColorOverwrites[],
    customBuckets: string,
  },
  categoricalOptions: {
    colorOverwrites: ColorOverwrites[],
    customCategoriesOrder: Array<any>,
  },
  selectedColumn: number | null,
}

export interface dataMetaDataCell {
  data: {
    footnote: string
  },
  rowIndex: number,
  colIndex: number,
}

export interface DataMetaData {
  cells: dataMetaDataCell[],
}

export interface QTableConfigOptions {
  hideTableHeader: Boolean,
  showTableSearch: Boolean,
  cardLayout: Boolean,
  cardLayoutIfSmall: Boolean,
  minibar: QTableConfigMinibarSettings,
  colorColumn: ColorColumnSettings
}

export interface QTableConfigMinibarSettings {
  invertColors: Boolean,
    barColor: {
      positive: { className: string, colorCode: string },
      negative: { className: string, colorCode: string },
    },
    selectedColumn: number
}

export interface QTableConfig {
  acronym: string;
  data: {
    table: QTableDataRaw,
    metaData: DataMetaData,
  },
  sources: Array<any>,
  options: QTableConfigOptions,
  title: string,
  subtitle: string,
  notes: string,
}

export interface QTableDataFormatted {
  type: string,
  value: string,
  classes: string[],
  footnote: {
    value: number,
    unicode: string,
    class: string | null,
  }
}

export interface DisplayOptions {

}

export interface ToolRuntimeConfig {
  displayOptions: DisplayOptions,
  fileRequestBaseUrl: string,
  toolBaseUrl: string,
  id: string,
  size: {
    width: Array<{ value: number, unit: string, comparison: '=' | '>' | '<' | '>=' | '<=' }>
  },
  isPure: Boolean,
  requestId: string,
  markup: string,
  noInteraction: boolean,
}

export interface RenderingInfo {
  polyfills: string[],
  stylesheets:Array<{name: string}>,
  scripts: Array<{content: string}>,
  markup: string,
}

export interface AvailabilityResponseObject {
  available: boolean;
}

export interface WebContextObject {
  item: QTableConfig, // To make renderingInfoScripts working. refactor later.
  config: QTableConfig,
  tableData: QTableDataFormatted[][],
  minibar: Minibar | null,
  footnotes: StructuredFootnote[] | null,
  colorColumn: ColorColumn | null,
  numberOfRows: number, // do not count the header
  displayOptions: DisplayOptions | {},
  noInteraction: boolean,
  id: string,
  width: number | undefined,
  initWithCardLayout: boolean,
  numberOfRowsToHide: number | undefined,
}

export interface WebPayload {
  item: QTableConfig,
  toolRuntimeConfig: ToolRuntimeConfig,
}

export type BucketType = 'ckmeans' | 'quantile' | 'equal' | 'custom';
export type ColorColumnType = 'numerical' | 'categorical';
export type QTableDataRaw = (string | null)[][];

interface ColorOverwrites {
  textColor: string,
  color: string,
  position: number,
}

export interface ColorColumn {
  colorColumnType: ColorColumnType,
  numericalOptions: {
    labelLegend: string,
    bucketType: BucketType,
    numberBuckets: number,
    scale: string,
    colorScheme: string,
    colorOverwrites: ColorOverwrites[],
  },
  categoricalOptions: {
    colorOverwrites: ColorOverwrites[],
    customCategoriesOrder: Array<any>,
  },
  selectedColumn: number,
}

export interface dataMetaDataCell {
  data: {
    footnote: string
  },
  rowIndex: number,
  colIndex: number,
}

export interface dataMetaData {
  cells: dataMetaDataCell[],
}

export interface QTableConfigOptions {
  hideTableHeader: Boolean,
    showTableSearch: Boolean,
    cardLayout: Boolean,
    cardLayoutIfSmall: Boolean,
    minibar: {
      invertColors: Boolean,
      barColor: {
        positive: { className: string, colorCode: string },
        negative: { className: string, colorCode: string },
      },
      selectedColumn: number
    },
    colorColumn: ColorColumn
}

export interface QTableConfig {
  acronym: string;
  data: {
    table: QTableDataRaw,
    metaData: dataMetaData,
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
}

export interface AvailabilityResponseObject {
  available: boolean;
}
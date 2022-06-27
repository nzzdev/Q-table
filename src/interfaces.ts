import { LABEL_LEGEND_ID } from './enums';
import { ColorColumn } from './helpers/colorColumn';
import { StructuredFootnote } from './helpers/footnotes';
import { Minibar } from './helpers/minibars';

export interface WebPayload {
  item: QTableConfig,
  itemStateInDb: boolean,
  toolRuntimeConfig: ToolRuntimeConfig,
}

export type BucketType = 'ckmeans' | 'quantile' | 'equal' | 'custom';
export type ColorColumnType = 'numerical' | 'categorical';
export type QTableDataRaw = (string | null)[][];

export const enum DivergingType {
  BUCKET = 'bucket',
  BORDER = 'border',
};

export type DivergingColorScaleFromBucket = `${DivergingType.BUCKET}-${number}`;
export type DivergingColorScaleFromBorder = `${DivergingType.BORDER}-${number}`;
export type NumericalScaleType = 'sequential' | DivergingColorScaleFromBucket | DivergingColorScaleFromBorder;

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
    scale: NumericalScaleType,
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

export interface QTableConfigOptions {
  hideTableHeader: boolean,
  showTableSearch: boolean,
  cardLayout: boolean,
  cardLayoutIfSmall: boolean,
  minibar: QTableConfigMinibarSettings,
  colorColumn: ColorColumnSettings,

  // This is added on 6.0.1 and we don't do any migration so earlier
  // saved tables in the databases will not have this option.
  hideLegend?: boolean,

  // This is added on 6.2.0 and we don't do any migration so earlier
  // saved tables in the databases will not have this option.
  pageSize?: number,
  usePagination?: boolean,
}

export interface QTableDataFormatted {
  type: string,
  value: string|null,
  classes: string[],
  footnote?: {
    value: number,
    unicode: string,
    class: string | null,
  }
}

export interface DisplayOptions {
  hideTitle?: boolean,
}

export interface ToolRuntimeConfig {
  displayOptions?: DisplayOptions,
  fileRequestBaseUrl: string,
  toolBaseUrl: string,
  id: string,
  size: {
    width: Array<{ value: number, unit: string, comparison: '=' | '>' | '<' | '>=' | '<=' }>
  },
  isPure: Boolean,
  requestId: string,
  markup?: string,
  noInteraction?: boolean,
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

export interface QTableSvelteProperties {
  item: QTableConfig, // To make renderingInfoScripts working. refactor later.
  config: QTableConfig,
  tableHead: QTableDataFormatted[],
  rows: QTableDataFormatted[][],
  minibar: Minibar | null,
  footnotes: StructuredFootnote[] | null,
  colorColumn: ColorColumn | null,
  numberOfRows: number, // do not count the header
  displayOptions: DisplayOptions,
  noInteraction: boolean,
  id: string,
  width: number | undefined,
  initWithCardLayout: boolean,
  pageSize: number,
  usePagination: boolean,
  hideTableHeader: boolean,
}

export interface QTableStateContext {
  getState: () => {
    page: number;
    pageIndex: number;
    pageSize: number;
    rows: QTableDataFormatted[][];
    filteredRows: QTableDataFormatted[][];
};
setPage: (_page: number) => void;
setPageSize: (_pageSize: number) => void;
setFilteredRows: (_rows: QTableDataFormatted[][]) => QTableDataFormatted[][];
}

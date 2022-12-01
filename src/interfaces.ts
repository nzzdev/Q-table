import type { LABEL_LEGEND_ID } from './enums';
import type { ColorColumn } from './helpers/colorColumn';
import type { Footnote } from './helpers/footnotes';
import type { Minibar } from './helpers/minibars';

export interface WebPayload {
  item: QTableConfig;
  itemStateInDb: boolean;
  toolRuntimeConfig: ToolRuntimeConfig;
}

export interface QTableConfig {
  acronym: string;
  data: {
    table: QTableDataRaw;
    metaData: DataMetaData;
  };
  sources: Source[];
  options: QTableConfigOptions;
  title: string;
  subtitle: string;
  notes: string;
}

export type BucketType = 'ckmeans' | 'quantile' | 'equal' | 'custom';
export type ColorColumnType = 'numerical' | 'categorical';
export type QTableDataRaw = QTableCellDataRaw[][];
export type QTableCellDataRaw = string | null;

export const enum DivergingType {
  BUCKET = 'bucket',
  BORDER = 'border',
}

export type DivergingColorScaleFromBucket = `${DivergingType.BUCKET}-${number}`;
export type DivergingColorScaleFromBorder = `${DivergingType.BORDER}-${number}`;
export type NumericalScaleType = 'sequential' | DivergingColorScaleFromBucket | DivergingColorScaleFromBorder;

export interface ColorOverwrites {
  textColor: string;
  color: string;
  position: number;
}

export interface ColorColumnSettings {
  colorColumnType: ColorColumnType;
  numericalOptions: {
    labelLegend: LABEL_LEGEND_ID;
    bucketType: BucketType;
    numberBuckets: number;
    scale: NumericalScaleType;
    colorScheme: string;
    colorOverwrites: ColorOverwrites[];
    customBuckets: string;
  };
  categoricalOptions: {
    colorOverwrites: ColorOverwrites[];
    customCategoriesOrder: CustomCategoriesOrder[];
  };
  selectedColumn: number | null;
}

export interface DataMetaData {
  cells: CellMetaData[];
}

export interface CellMetaData {
  data: {
    footnote: string;
  };
  rowIndex: number;
  colIndex: number;
}


export interface QTableConfigMinibarSettings {
  invertColors: boolean;
  barColor: {
    positive: { className: string; colorCode: string };
    negative: { className: string; colorCode: string };
  };
  selectedColumn: number | null;
}

export interface QTableConfigOptions {
  hideTableHeader: boolean;
  showTableSearch: boolean;
  cardLayout: boolean;
  cardLayoutIfSmall: boolean;
  minibar: QTableConfigMinibarSettings;
  colorColumn: ColorColumnSettings;

  // This is added on 6.0.1 and we don't do any migration so earlier
  // saved tables in the databases will not have this option.
  hideLegend?: boolean;

  // This is added on 6.2.0 and we don't do any migration so earlier
  // saved tables in the databases will not have this option.
  pageSize?: number;

  // Added in 7.1.0. No migration so not in db of older saves.
  frozenRowKey?: number | null;

  // Added 7.1.0
  sorting?: QTableConfigSortingSettings[];

  // Added 7.1.0
  formatting?: QtableConfigFormattingSetting[];
}

export interface QTableConfigSortingSettings {
  column: number;
  sortingDirection: SortDirection;
}

export interface QtableConfigFormattingSetting {
  column: number;
  formattingType: FormattingType;
}

// Check schema.json.
// Keep in sync.
export type FormattingType =
  'country_flags' |
  '0' |
  '0.00' |
  '0.000' |
  '0%' |
  '0.0%' |
  '0.00%' |
  '0.000%' |
  'arrow_sign_relative_int';

export interface DisplayOptions {
  hideTitle?: boolean;
}

export interface ToolRuntimeConfig {
  displayOptions?: DisplayOptions;
  fileRequestBaseUrl: string;
  toolBaseUrl: string;
  id: string;
  size: ToolRuntimeConfigSize;
  isPure: boolean;
  requestId: string;
  markup?: string;
  noInteraction?: boolean;
}

export interface ToolRuntimeConfigSize {
  width: Array<{ value: number; unit: string; comparison: '=' | '>' | '<' | '>=' | '<=' }>;
}

export interface RenderingInfo {
  polyfills: string[];
  stylesheets: Array<{ name: string }>;
  scripts: Array<{ content: string }>;
  markup: string;
}

export interface AvailabilityResponseObject {
  available: boolean;
}

export interface QTableSvelteProperties {
  item: QTableConfig; // To make renderingInfoScripts working. refactor later.
  config: QTableConfig;
  tableHead: Thead[];
  rows: Row[];
  minibar: Minibar | null;
  footnotes: Footnote[] | null;
  colorColumn: ColorColumn | null;
  numberOfRows: number; // do not count the header
  displayOptions: DisplayOptions;
  noInteraction: boolean;
  id: string;
  width: number | undefined;
  initWithCardLayout: boolean;
  pageSize: number;
  hideTableHeader: boolean;
  frozenRowKey?: number | null;
}

export interface QTableStateContext {
  getState: () => {
    page: number;
    pageIndex: number;
    pageSize: number;
    rows: Row[];
    filteredRows: Row[];
  };
  setPage: (_page: number) => void;
  setPageSize: (_pageSize: number) => void;
  setFilteredRows: (_rows: Row[]) => Row[];
}

export interface QTableSortState {
  colIndex: number | null;
  sortDirection: SortDirection;
}

export interface Source {
  link: {
    url?: string;
    isValid?: boolean;
  };
  text: string;
}

export interface CustomCategoriesOrder {
  category: string;
}

export interface StyleHashMap {
  'q-table': string;
}

export interface Column {
  type: TableColumnType;
  values: (string | number)[];
  formattedValues: string[];
}

export type TableColumnType = 'text' | 'numeric' | 'country-flag-emoji';

export interface Row {
  key: number;
  cells: Cell[];
  frozen?: boolean;
}

export interface Thead {
  value: string;
  type: TableColumnType;
  sortable: boolean;
  sortDirection: SortDirection;
  classes: string[],
  footnote: string;
}

export interface Cell<T = number | string> {
  type: TableColumnType
  value: T;
  label: string; // String representation of value.
  classes: string[];
  footnote: string;
}

export type CellType = 'text' | 'numeric' | null

export type SortDirection = 'asc' | 'desc' | null;
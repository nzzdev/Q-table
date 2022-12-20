import { formatLocale as d3FormatLocale } from 'd3-format';
import CountryFlagEmojis from '@nzz/et-utils-country-flag-emoji';

// Types.
import type { Bucket, FormattedBucket } from './colorColumnLegend.js';
import type { FootnoteCellMap } from './footnotes.js';
import type { ColorColumnSettings, QTableDataRaw, QTableConfigOptions, Row, TableColumnType, QTableCellDataRaw, Cell, FormattingType, Thead, QtableConfigFormattingSetting } from '../interfaces';

const fourPerEmSpace = '\u2005';
const enDash = '\u2013';

// Formatting for numbers of >= 10000.
const formatLocale = d3FormatLocale({
  decimal: ',',
  thousands: fourPerEmSpace,
  minus: enDash,
  grouping: [3],
  currency: ['€', ''],
});

// Formatting for numbers of <= 10000.
const formatLocaleSmall = d3FormatLocale({
  decimal: ',',
  minus: enDash,
  currency: ['€', ''],
  thousands: fourPerEmSpace,
  grouping: [10], // Set the grouping high so numbers under 10000 do not get grouped.
});

const formatWithGroupingSeparator = formatLocale.format(',');
// const formatNoGroupingSeparator = formatLocale.format('');


/**
 * This is the most important function.
 * It takes in the raw data from the user input and transform it into
 * a structure we can use for our components.
 */
export function formatTableData(dataWithHeader: QTableDataRaw, footnotes: FootnoteCellMap, options: QTableConfigOptions): ProcessedTableData  {
  const header: Thead[] = [];
  const rows: Row[] = [];
  const columns: Cell[][] = [];

  // First get the type of each column.
  const columnTypes = getColumnsType(dataWithHeader);

  const formatting = options.formatting || [];
  const sortingOptions = options.sorting || [];

  const formattingMap: Record<number, QtableConfigFormattingSetting | undefined> = {};

  formatting.forEach(f => {
    formattingMap[f.column] = f;
  });

  // Format the header.
  for (let colIndex = 0; colIndex < dataWithHeader[0].length; colIndex++) {
    const sortableOption = sortingOptions.find(d => d.column === colIndex);

    let sortable = false;
    let sortDirection = null;

    if (sortableOption) {
      sortable = true;
      sortDirection = sortableOption.sortingDirection;
    }

    header.push({
      value: dataWithHeader[0][colIndex] || '',
      type: columnTypes[colIndex],
      sortable,
      sortDirection,
      classes: [],
      footnote: footnotes.get(`-1-${colIndex}`) || '',
    });

    // Create column arrays.
    // easier so we don't have to do if checks later.
    columns[colIndex] = [];
  }

  // Go through each row and create the correct cell.
  // note: start at index 1 to skip header.
  for (let rowIndex = 1; rowIndex < dataWithHeader.length; rowIndex++) {
    const row = dataWithHeader[rowIndex];
    const normalizedRowIndex = rowIndex - 1; // without header row.

    const cells = row.map((rawCellValue, colIndex) => {
      const formatting = formattingMap[colIndex]?.formattingType;

      const type = columnTypes[colIndex];
      let cell: Cell;

      if (formatting) {
        cell = formatCell(rawCellValue, formatting);
      } else {
        switch (type) {
          case 'numeric':
            cell = formaticNumericData(rawCellValue);
            break;

          case 'text':
          default:
            cell = formatTextualData(rawCellValue);
            break;
        }
      }

      columns[colIndex].push(cell);

      cell.footnote = footnotes.get(`${normalizedRowIndex}-${colIndex}`) || '';
      return cell;
    });

    rows.push({
      key: normalizedRowIndex,
      cells,
    });
  }

  return {
    header,
    rows,
    columns,
  }
}

function formatCell(rawValue: QTableCellDataRaw, type: FormattingType): Cell {
  let label = '';

  if (type === 'country_flags') {
    return formatCountryFlagEmojiDatapoint(rawValue);
  }

  const parsedRawValue = parseFloat(rawValue || '');

  let prefix = '';

  switch (type) {
    case '0':
      label = parsedRawValue.toString();
      break;

    case '0.00':
      label = formatLocale.format('.2f')(parsedRawValue);
      break;

    case '0.000':
      label = formatLocale.format('.3f')(parsedRawValue);
      break;

    case '0%':
      label = formatLocale.format('.0f')(parsedRawValue) + '%';
      break;

    case '0.0%':
      label = formatLocale.format('.1f')(parsedRawValue) + '%';
      break;

    case '0.00%':
      label = formatLocale.format('.2f')(parsedRawValue) + '%';
      break;

    case '0.000%':
      label = formatLocale.format('.3f')(parsedRawValue) + '%';
      break;

    case 'arrow_sign_relative_int':
      if (parsedRawValue > 0) {
        prefix = '➚ +';
      } else if (parsedRawValue < 0) {
        prefix = '➘ ';
      } else {
        prefix = '➙ ';
      }

      label = `${prefix}${parsedRawValue}%`;
      break;

    default:
      label = parsedRawValue.toString();
      break;
  }

  return {
    type: 'numeric',
    value: parsedRawValue,
    label,
    footnote: '',
    classes: ['s-font-note--tabularnums'],
  }
}


function formatCountryFlagEmojiDatapoint(rawValue: QTableCellDataRaw): Cell {
  let label = '';

  if (typeof rawValue === 'string') {
    const valueRetyped = rawValue.toUpperCase() as (keyof typeof CountryFlagEmojis);

    if (CountryFlagEmojis[valueRetyped]) {
      label = CountryFlagEmojis[valueRetyped];
    }
  }

  return {
    type: 'country-flag-emoji',
    value: rawValue || '',
    label: label,
    footnote: '',
    classes: [],
  }
}

function formatTextualData(rawValue: QTableCellDataRaw): Cell {
  return {
    type: 'text',
    value: rawValue || '',
    label: rawValue || '',
    classes: [],
    footnote: '',
  }
}

function formaticNumericData(rawValue: QTableCellDataRaw): Cell {
  let label = '';
  let value = 0;

  if (rawValue === '' || rawValue === '-' || rawValue === enDash) {
    label = rawValue;
  } else if (rawValue !== null) {
    const parsedValue = parseFloat(rawValue);

    value = parsedValue;
    label = formatWithGroupingSeparator(parsedValue);

    // Todo discuss with team later.
    // why are different formattings for when there are numbers over 10000
    // in the dataset??
    // if (columns[columnIndex].withFormating) {
    //   value = formatWithGroupingSeparator(parsedValue);
    // } else {
    //   value = formatNoGroupingSeparator(parsedValue);
    // }
  }

  return {
    type: 'numeric',
    value,
    label,
    classes: ['s-font-note--tabularnums'],
    footnote: '',
  }
}

export function getNumericColumns(data: QTableDataRaw): IndexedColumnTitle[] {
  const columns = getColumnsType(data);
  const numericColumns: IndexedColumnTitle[] = [];

  // data[0].length is undefined when creating a new item.
  if (data[0] !== undefined) {
    const header = data[0];

    for (let columnIndex = 0; columnIndex < header.length; columnIndex++) {
      if (columns[columnIndex] && columns[columnIndex] === 'numeric') {
        const cell = header[columnIndex] || '';
        numericColumns.push({ title: cell, index: columnIndex });
      }
    }
  }

  return numericColumns;
}

export function getCategoricalColumns(data: QTableDataRaw): IndexedColumnTitle[] {
  const categoricalColumns: IndexedColumnTitle[] = [];

  // data[0].length is undefined when creating a new item
  if (data[0] !== undefined) {
    const row = data[0];

    for (let columnIndex = 0; columnIndex < row.length; columnIndex++) {
      const cell = row[columnIndex] as string; // TODO: check.
      categoricalColumns.push({ title: cell, index: columnIndex });
    }
  }

  return categoricalColumns;
}

export function isNumeric(cell: string | null): boolean {
  if (typeof cell !== 'string') {
    return false;
  }

  // If it does not match a number signature abort.
  if (!cell.match(/^[+-]?\d+(\.\d+)?$/)) return false;

  // Check if it parses should it match a number signature.
  const parsed = parseFloat(cell);
  if (isNaN(parsed)) {
    return false;
  }

  return true;
}


export function getColumnsType(dataWithHeader: QTableDataRaw): TableColumnType[] {
  const columns: TableColumnType[] = [];

  const columnAmount = dataWithHeader[0].length;

  for (let c = 0; c < columnAmount; c++) {
    const column: QTableCellDataRaw[] = [];

    // Take all columns in one array.
    // note: start at index 1 to skip header.
    for (let row = 1; row < dataWithHeader.length; row++) {
      column.push(dataWithHeader[row][c]);
    }

    const isNumeric = isColumnNumeric(column);

    if (isNumeric) {
      columns.push('numeric');
    } else {
      columns.push('text');
    }

    // TODO: move somewhere else.
    // let withFormating = false;
    // const columnNumeric = isColumnNumeric(column);

    // if (columnNumeric) {
    //   const numericValuesInColumn: number[] = [];

    //   for (let i = 0; i < column.length; i++) {
    //     const parsedValue = parseFloat(column[i] || '');

    //     if (!isNaN(parsedValue)) {
    //       numericValuesInColumn.push(parsedValue);
    //     }
    //   }

    //   withFormating = Math.max(...numericValuesInColumn) >= 10000 || Math.min(...numericValuesInColumn) <= -10000;
    // }

    // columns.push({ isNumeric: columnNumeric, withFormating });
  }

  return columns;
}

function isColumnNumeric(rawColumnData: QTableCellDataRaw[]): boolean {
  // Loop through all cells checking if it is a number and on the way
  // preparing the formatting.
  for (let i = 0; i < rawColumnData.length; i++) {
    const value = rawColumnData[i];

    // TODO
    // The question should we accept a string as an exception for a numeric column or force the user to
    // keep it null or empty?
    if (value === null || value === '-') {
      continue;
    }

    // If we detect any non numeric value then this column is not numeric anymore.
    if (!isNumeric(value)) {
      return false;
    }
  }


  return true;
}



export function getNumericalValuesByColumn(data: QTableDataRaw, column: number): Array<number | null> {
  return data.map(row => {
    if (!row[column]) row[column] = null;

    const val = row[column];
    let return_val: number | null = null;

    if (typeof val === 'string' && val.match(/^[+-]?\d+(\.\d+)?$/)) {
      return_val = parseFloat(val);
    }

    return return_val;
  });
}

export function getCategoricalValuesByColumn(data: QTableDataRaw, column: number): (string | null)[] {
  return data.map(row => {
    if (!row[column]) row[column] = null;

    return row[column];
  });
}

export function getNonNullValues(values: Array<number | null>): number[] {
  return values.filter(value => value !== null) as number[];
}

export function getMetaData(values: (number | null)[], numberValues: number[], maxDigitsAfterComma: number): MetaData {
  return {
    hasNullValues: values.find(value => value === null) !== undefined,
    hasZeroValues: numberValues.find(value => value === 0) !== undefined,
    maxValue: Math.max(...numberValues),
    minValue: Math.min(...numberValues),
    averageValue: getRoundedAverage(numberValues, maxDigitsAfterComma),
    medianValue: getRoundedMedian(numberValues, maxDigitsAfterComma),
  };
}

export function getDataWithoutHeaderRow(data: QTableDataRaw): QTableDataRaw {
  return data.slice(1);
}

export function getUniqueCategoriesCount(data: QTableDataRaw, colorColumn: ColorColumnSettings): number {
  return getUniqueCategoriesObject(data, colorColumn).categories.length;
}

export function getUniqueCategoriesObject(data: QTableDataRaw, colorColumnSettings: ColorColumnSettings): UniqueCategories {
  const { categoricalOptions, selectedColumn } = colorColumnSettings;
  const customCategoriesOrder = categoricalOptions.customCategoriesOrder;

  let hasNullValues = false;
  let values: string[] = [];

  if (typeof selectedColumn === 'number') {
    values = data
      .map(row => row[selectedColumn])
      .filter(value => {
        if (value !== null && value !== '') {
          return true;
        }

        hasNullValues = true;
        return false;
      }) as string[];
  }

  const sortedValuesbyCount = sortValuesByCount(values);

  // If the user has set a custom order, sort the categories accordingly
  if (customCategoriesOrder) {
    sortedValuesbyCount.sort(function (a, b) {
      return customCategoriesOrder.map(c => c.category).indexOf(a) - customCategoriesOrder.map(c => c.category).indexOf(b);
    });
  }

  const categories = Array.from(new Set(sortedValuesbyCount));

  return { hasNullValues, categories };
}

function sortValuesByCount(values: string[]): string[] {
  // Count how much each value appears.
  const counter: Record<string, number> = {};
  for (let i = 0; i < values.length; i++) {
    const key = values[i];
    counter[key] = 1 + counter[key] || 1;
  }

  // Sort counter by amount of appearance.
  const sortedCounter = Object.entries(counter).sort((a, b) => b[1] - a[1]);

  // Return only the values. The amount of appearance is not necessary.
  return sortedCounter.map(x => x[0]);
}

export function getMaxDigitsAfterCommaInDataByRow(data: QTableDataRaw, rowIndex: number): number {
  let maxDigitsAfterComma = 0;

  data.forEach(row => {
    const value = row[rowIndex];

    if (typeof value === 'string') {
      const digitsAfterComma = getDigitsAfterComma(value);
      maxDigitsAfterComma = Math.max(maxDigitsAfterComma, digitsAfterComma);
    }
  });

  return maxDigitsAfterComma;
}

function getDigitsAfterComma(value: string): number {
  const digitsAfterComma = value.split('.');

  if (digitsAfterComma.length > 1) {
    return digitsAfterComma[1].length;
  }

  return 0;
}

export function getFormattedValue(value: number | null, maxDigitsAfterComma: number | null): string {
  if (value === null) {
    return '';
  }

  let formatSpecifier = ',';

  // if we have float values in data set we extend all float values
  // to max number of positions after comma, e.g. format specifier
  // could be ",.2f" for 2 positions after comma
  if (typeof maxDigitsAfterComma === 'number') {
    formatSpecifier = `,.${maxDigitsAfterComma}f`;
  }

  // if we have number >= 10 000 we add a space after each 3 digits
  if (value >= Math.pow(10, 4)) {
    return formatLocale.format(formatSpecifier)(value);
  } else {
    return formatLocaleSmall.format(formatSpecifier)(value);
  }
}

export function getFormattedBuckets(formattingOptions: DataFormattingOptions, buckets: Bucket[]): FormattedBucket[] {
  return buckets.map(bucket => {
    const { from, to, color } = bucket;

    if (formattingOptions.roundingBucketBorders) {
      return {
        from: getFormattedValue(from, formattingOptions.maxDigitsAfterComma),
        to: getFormattedValue(to, formattingOptions.maxDigitsAfterComma),
        color,
      };
    }

    return {
      from: getFormattedValue(null, from),
      to: getFormattedValue(null, to),
      color,
    };
  });
}

export function getRoundedValue(value: number, maxDigitsAfterComma: number): number {
  // Default: round to two digits after comma.
  let roundingFactor = 100;

  // If data contains more precise float numbers we extend
  // each value to max number of digits after comma.
  if (maxDigitsAfterComma !== undefined && maxDigitsAfterComma > 2) {
    roundingFactor = Math.pow(10, maxDigitsAfterComma);
  }

  return Math.round(value * roundingFactor) / roundingFactor;
}

export function getCustomBucketBorders(customBuckets: string): number[] {
  const customBorderStrings = customBuckets.split(',');

  return customBorderStrings.map(value => {
    return parseFloat(value.trim());
  });
}

/**
 * Internal.
 */
function getMedian(values: number[]): number {
  const middleIndex = Math.floor(values.length / 2);
  const sortedNumbers = [...values].sort((a, b) => a - b);

  if (values.length % 2 !== 0) {
    return sortedNumbers[middleIndex];
  }

  return (sortedNumbers[middleIndex - 1] + sortedNumbers[middleIndex]) / 2;
}

function getRoundedMedian(values: number[], maxDigitsAfterComma: number): number {
  const medianValue = getMedian(values);
  return getRoundedValue(medianValue, maxDigitsAfterComma);
}

function getAverage(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function getRoundedAverage(values: number[], maxDigitsAfterComma: number): number {
  const averageValue = getAverage(values);
  return getRoundedValue(averageValue, maxDigitsAfterComma);
}

/**
 * Interfaces.
 */
export interface ProcessedTableData {
  header: Thead[];
  rows: Row[];
  columns: Cell[][];
}

export interface MetaData {
  hasNullValues: boolean;
  hasZeroValues: boolean;
  maxValue: number;
  minValue: number;
  averageValue: number;
  medianValue: number;
}

export interface DataFormattingOptions {
  maxDigitsAfterComma: number;
  roundingBucketBorders?: boolean;
}

interface IndexedColumnTitle {
  index: number;
  title: string;
}

interface UniqueCategories {
  hasNullValues: boolean;
  categories: string[];
}

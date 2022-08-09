/// <reference path="../modules.d.ts" />

import { formatLocale as d3FormatLocale } from 'd3-format';
import { appendFootnoteAnnotationsToTableData } from './footnotes.js';

// Types.
import type { StructuredFootnote } from './footnotes';
import type { ColorColumnSettings, QTableDataFormatted, QTableDataRaw, QTableConfigOptions } from '../interfaces';
import type { Bucket, FormattedBucket } from './colorColumnLegend.js';

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
const formatNoGroupingSeparator = formatLocale.format('');

export function getNumericColumns(data: QTableDataRaw): IndexedColumnTitle[] {
  const columns = getColumnsType(data);
  const numericColumns: IndexedColumnTitle[] = [];

  // data[0].length is undefined when creating a new item.
  if (data[0] !== undefined) {
    const row = data[0];

    for (let columnIndex = 0; columnIndex < row.length; columnIndex++) {
      if (columns[columnIndex] && columns[columnIndex].isNumeric) {
        const cell = row[columnIndex] as string; // TODO: check.
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
    return false
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

function getColumnsType(data: QTableDataRaw): ColumnType[] {
  const columns: ColumnType[]  = [];
  const table = getDataWithoutHeaderRow(data);

  const columnAmount = table[0].length;

  for (let c = 0; c < columnAmount; c++) {
    const column: (string|null)[] = [];

    // Take all columns in one array
    for (let r = 0; r < table.length; r++) {
      column.push(table[r][c])
    }

    let withFormating = false;
    const columnNumeric = isColumnNumeric(column);

    if (columnNumeric) {
      const numericValuesInColumn: number[] = [];

      for (let i = 0; i < column.length; i++) {
        const parsedValue = parseFloat(column[i] || '');

        if(!isNaN(parsedValue)) {
          numericValuesInColumn.push(parsedValue);
        }
      }

      withFormating =
        Math.max(...numericValuesInColumn) >= 10000 ||
        Math.min(...numericValuesInColumn) <= -10000;
    }

    columns.push({ isNumeric: columnNumeric, withFormating });
  }

  return columns;
}

function isColumnNumeric(column: (string|null)[]): boolean {
  // Loop through all cells and if one cell is not numeric
  for (let i = 0 ; i < column.length; i++) {
    const value = column[i];

    // If we detect any non numeric value then this column is not numeric anymore.
    if (!isNumeric(value)) {
      return false;
    }
  }

  return true;
}

export function formatTableData(data: QTableDataRaw, footnotes: StructuredFootnote[], options: QTableConfigOptions): QTableDataFormatted[][] {
  const columns = getColumnsType(data);
  let tableData: QTableDataFormatted[][] = [];

  for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
    const row = data[rowIndex];

    let cells = row.map((cell, columnIndex) => {
      let type = 'text';
      let value = cell;

      let classes: string[] = [];

      if (columns[columnIndex] && columns[columnIndex].isNumeric) {
        type = 'numeric';
        classes.push('s-font-note--tabularnums');

        // Do not format the header row, empty cells, a hyphen(-) or a en dash (–).
        if (
          rowIndex > 0 &&
          cell !== null &&
          cell !== '' &&
          cell != '-' &&
          cell != enDash
        ) {
          const parsedValue = parseFloat(cell);
          if (columns[columnIndex].withFormating) {
            value = formatWithGroupingSeparator(parsedValue);
          } else {
            value = formatNoGroupingSeparator(parsedValue);
          }
        }
      }

      return {
        type: type,
        value: value,
        classes: classes,
      };
    });

    tableData.push(cells);
  }

  if (footnotes.length > 0) {
    tableData = appendFootnoteAnnotationsToTableData(tableData, footnotes, options);
  }

  return tableData;
}

export function getNumericalValuesByColumn(data: QTableDataRaw, column: number): Array<number|null> {
  return data.map((row) => {
    if (!row[column]) row[column] = null;

    const val = row[column];
    let return_val: number | null = null;

    if (typeof val === 'string' && val.match(/^[+-]?\d+(\.\d+)?$/)) {
        return_val = parseFloat(val);
    }

    return return_val;
  });
}

export function getCategoricalValuesByColumn(data: QTableDataRaw, column: number): (string|null)[] {
  return data.map(row => {
    if (!row[column]) row[column] = null;

    return row[column];
  });
}

export function getNonNullValues(values: Array<number|null>): number[] {
  return values.filter(value => value !== null) as number[];
}

export function getMetaData(values: (number|null)[], numberValues: number[], maxDigitsAfterComma: number): MetaData {
  return {
    hasNullValues: values.find((value) => value === null) !== undefined,
    hasZeroValues: numberValues.find((value) => value === 0) !== undefined,
    maxValue: Math.max(...numberValues),
    minValue: Math.min(...numberValues),
    averageValue: getRoundedAverage(numberValues, maxDigitsAfterComma),
    medianValue: getRoundedMedian(numberValues, maxDigitsAfterComma),
  };
}

export function getDataWithoutHeaderRow(data: QTableDataRaw): QTableDataRaw {
  return data.slice(1);
}

export function getUniqueCategoriesCount(data: QTableDataRaw, colorColumn: ColorColumnSettings) {
  return getUniqueCategoriesObject(data, colorColumn).categories.length;
}

export function getUniqueCategoriesObject(data: QTableDataRaw, colorColumnSettings: ColorColumnSettings) {
  const { categoricalOptions, selectedColumn } = colorColumnSettings;
  let customCategoriesOrder = categoricalOptions.customCategoriesOrder;
  let hasNullValues = false;
  let values: string[] = [];

  if (typeof selectedColumn === 'number') {
    values = data
      .map(row => row[selectedColumn])
      .filter((value) => {
        if (value !== null && value !== '') {
          return true;
        }

        hasNullValues = true;
        return false;
      }) as string[];
  }

  let sortedValuesbyCount = sortValuesByCount(values);

  // If the user has set a custom order, sort the categories accordingly
  if (customCategoriesOrder) {
    sortedValuesbyCount.sort(function (a, b) {
      return (
        customCategoriesOrder.map((c) => c.category).indexOf(a) -
        customCategoriesOrder.map((c) => c.category).indexOf(b)
      );
    });
  }

  const categories = Array.from(new Set(sortedValuesbyCount));

  return { hasNullValues, categories };
}

function sortValuesByCount(values: string[]): string[] {
  // Count how much each value appears.
  let counter: Record<string, number> = {};
  for (let i = 0; i < values.length; i++) {
    const key = values[i];
    counter[key] = 1 + counter[key] || 1;
  }

  // Sort counter by amount of appearance.
  let sortedCounter = Object.entries(counter).sort((a, b) => b[1] - a[1]);

  // Return only the values. The amount of appearance is not necessary.
  return sortedCounter.map(x => x[0]);
}

export function getMaxDigitsAfterCommaInDataByRow(data: QTableDataRaw, rowIndex: number): number {
  let maxDigitsAfterComma = 0;

  data.forEach((row) => {
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

export function getFormattedValue(formattingOptions: DataFormattingOptions, value: number | null): string {
  if (value === null) {
    return '';
  }

  let formatSpecifier = ',';

  // if we have float values in data set we extend all float values
  // to max number of positions after comma, e.g. format specifier
  // could be ",.2f" for 2 positions after comma
  if (formattingOptions.maxDigitsAfterComma) {
    formatSpecifier = `,.${formattingOptions.maxDigitsAfterComma}f`;
  }

  // if we have number >= 10 000 we add a space after each 3 digits
  if (value >= Math.pow(10, 4)) {
    return formatLocale.format(formatSpecifier)(value);
  } else {
    return formatLocaleSmall.format(formatSpecifier)(value);
  }
}

export function getFormattedBuckets(formattingOptions: DataFormattingOptions, buckets: Bucket[]): FormattedBucket[] {
  return buckets.map((bucket) => {
    let { from, to, color } = bucket;

    if (formattingOptions.roundingBucketBorders) {
      return {
        from: getFormattedValue(formattingOptions, from),
        to: getFormattedValue(formattingOptions, to),
        color,
      };
    }

    return {
      from: getFormattedValue({}, from),
      to: getFormattedValue({}, to),
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

  return customBorderStrings.map((value) => {
    return parseFloat(value.trim());
  });
}

/**
 * Internal.
 */
function getMedian(values: number[]): number {
  let middleIndex = Math.floor(values.length / 2);
  let sortedNumbers = [...values].sort((a, b) => a - b);

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
export interface MetaData {
  hasNullValues: boolean,
  hasZeroValues: boolean,
  maxValue: number,
  minValue: number,
  averageValue: number,
  medianValue: number,
}

export interface DataFormattingOptions {
  maxDigitsAfterComma?: number,
  roundingBucketBorders?: boolean,
}

interface ColumnType {
  isNumeric: boolean,
  withFormating: boolean,
}

interface IndexedColumnTitle {
  index: number,
  title: string,
}

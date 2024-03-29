import Ajv from 'ajv';
import Boom from '@hapi/boom';
import { formatLocale as formatLocale$1 } from 'd3-format';
import CountryFlags from '@nzz/et-utils-country-flags';
import * as simpleStatistics from 'simple-statistics';
import { readFileSync } from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import Joi from 'joi';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function getExactPixelWidth(toolRuntimeConfig) {
    if (!toolRuntimeConfig.size || !Array.isArray(toolRuntimeConfig.size.width)) {
        return undefined;
    }
    for (const width of toolRuntimeConfig.size.width) {
        if (width && width.value && width.comparison === '=' && (!width.unit || width.unit === 'px')) {
            return width.value;
        }
    }
    return undefined;
}

const fourPerEmSpace = '\u2005';
const enDash = '\u2013';
// Formatting for numbers of >= 10000.
const formatLocale = formatLocale$1({
    currency: ['€', ''],
    decimal: ',',
    grouping: [3],
    minus: enDash,
    thousands: fourPerEmSpace,
});
// Formatting for numbers of <= 10000.
const formatLocaleSmall = formatLocale$1({
    currency: ['€', ''],
    decimal: ',',
    grouping: [10],
    minus: enDash,
    thousands: fourPerEmSpace,
});
const formatWithGroupingSeparator = formatLocale.format(',');
const formatNoGroupingSeparator = formatLocaleSmall.format('');
/**
 * This is the most important function.
 * It takes in the raw data from the user input and transform it into
 * a structure we can use for our components.
 */
function formatTableData(dataWithHeader, footnotes, options) {
    const header = [];
    const rows = [];
    const columns = [];
    // First get the type of each column.
    const columnMetadata = getColumnsType(dataWithHeader);
    const formatting = options.formatting || [];
    const sortingOptions = options.sorting || [];
    const formattingMap = {};
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
            type: columnMetadata[colIndex].type,
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
            var _a;
            const formatting = (_a = formattingMap[colIndex]) === null || _a === void 0 ? void 0 : _a.formattingType;
            const type = columnMetadata[colIndex].type;
            const useGroupingSeparator = columnMetadata[colIndex].useGroupingSeparatorForNumbers;
            let cell;
            if (formatting) {
                cell = formatCell(rawCellValue, formatting, useGroupingSeparator);
            }
            else {
                switch (type) {
                    case 'numeric':
                        cell = formaticNumericData(rawCellValue, useGroupingSeparator);
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
    };
}
function formatCell(rawValue, type, useGroupingSeparator = false) {
    let label = '';
    if (type === 'country_flags') {
        return formatCountryFlagDatapoint(rawValue);
    }
    const parsedRawValue = parseFloat(rawValue || '');
    if (isNaN(parsedRawValue)) {
        return {
            type: 'text',
            value: parsedRawValue,
            label: '',
            footnote: '',
            classes: [''],
        };
    }
    let prefix = '';
    let separator = '';
    if (useGroupingSeparator) {
        separator = ',';
    }
    switch (type) {
        case '0':
            label = formatLocale.format(`${separator}.0f`)(parsedRawValue);
            break;
        case '0.00':
            label = formatLocale.format(`${separator}.2f`)(parsedRawValue);
            break;
        case '0.000':
            label = formatLocale.format(`${separator}.3f`)(parsedRawValue);
            break;
        case '0%':
            label = formatLocale.format(`${separator}.0f`)(parsedRawValue) + '%';
            break;
        case '0.0%':
            label = formatLocale.format(`${separator}.1f`)(parsedRawValue) + '%';
            break;
        case '0.00%':
            label = formatLocale.format(`${separator}.2f`)(parsedRawValue) + '%';
            break;
        case '0.000%':
            label = formatLocale.format(`${separator}.3f`)(parsedRawValue) + '%';
            break;
        case 'arrow_sign_relative_int':
            if (parsedRawValue > 0) {
                prefix = '➚ +';
            }
            else if (parsedRawValue < 0) {
                prefix = '➘ ';
            }
            else {
                prefix = '➙ ';
            }
            label = `${prefix}${formatLocale.format(`${separator}`)(parsedRawValue)}%`;
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
    };
}
function formatCountryFlagDatapoint(rawValue) {
    let label = '';
    if (typeof rawValue === 'string') {
        const valueRetyped = rawValue.toUpperCase();
        if (CountryFlags[valueRetyped]) {
            label = CountryFlags[valueRetyped];
        }
    }
    return {
        type: 'country-flag-emoji',
        value: rawValue || '',
        label: label,
        footnote: '',
        classes: [],
    };
}
function formatTextualData(rawValue) {
    return {
        type: 'text',
        value: rawValue || '',
        label: rawValue || '',
        classes: [],
        footnote: '',
    };
}
function formaticNumericData(rawValue, useGroupingSeparator = false) {
    let label = '';
    let value = 0;
    if (rawValue === '' || rawValue === '-' || rawValue === enDash) {
        label = rawValue;
    }
    else if (rawValue !== null) {
        const parsedValue = parseFloat(rawValue);
        value = parsedValue;
        if (useGroupingSeparator) {
            label = formatWithGroupingSeparator(parsedValue);
        }
        else {
            label = formatNoGroupingSeparator(parsedValue);
        }
    }
    return {
        type: 'numeric',
        value,
        label,
        classes: ['s-font-note--tabularnums'],
        footnote: '',
    };
}
function getNumericColumns(data) {
    const columns = getColumnsType(data);
    const numericColumns = [];
    // data[0].length is undefined when creating a new item.
    if (data[0] !== undefined) {
        const header = data[0];
        for (let columnIndex = 0; columnIndex < header.length; columnIndex++) {
            if (columns[columnIndex] && columns[columnIndex].type === 'numeric') {
                const cell = header[columnIndex] || '';
                numericColumns.push({ title: cell, index: columnIndex });
            }
        }
    }
    return numericColumns;
}
function getCategoricalColumns(data) {
    const categoricalColumns = [];
    // data[0].length is undefined when creating a new item
    if (data[0] !== undefined) {
        const row = data[0];
        for (let columnIndex = 0; columnIndex < row.length; columnIndex++) {
            const cell = row[columnIndex]; // TODO: check.
            categoricalColumns.push({ title: cell, index: columnIndex });
        }
    }
    return categoricalColumns;
}
function isNumeric(cell) {
    if (typeof cell !== 'string') {
        return false;
    }
    // If it does not match a number signature abort.
    if (!cell.match(/^[+-]?\d+(\.\d+)?$/))
        return false;
    // Check if it parses should it match a number signature.
    const parsed = parseFloat(cell);
    if (isNaN(parsed)) {
        return false;
    }
    return true;
}
function getColumnsType(dataWithHeader) {
    const columns = [];
    const columnAmount = dataWithHeader[0].length;
    for (let c = 0; c < columnAmount; c++) {
        const column = [];
        // Take all columns in one array.
        // note: start at index 1 to skip header.
        for (let row = 1; row < dataWithHeader.length; row++) {
            column.push(dataWithHeader[row][c]);
        }
        const isNumeric = isColumnNumeric(column);
        if (isNumeric) {
            columns.push({
                type: 'numeric',
                useGroupingSeparatorForNumbers: isColumnFormattingWithNumberSeparator(column),
            });
        }
        else {
            columns.push({
                type: 'text',
                useGroupingSeparatorForNumbers: false,
            });
        }
    }
    return columns;
}
function isColumnNumeric(rawColumnData) {
    for (let i = 0; i < rawColumnData.length; i++) {
        const value = rawColumnData[i];
        if (value === null || value === '-' || value === '') {
            continue;
        }
        // If we detect any non numeric value then this column is not numeric anymore.
        if (!isNumeric(value)) {
            return false;
        }
    }
    return true;
}
function isColumnFormattingWithNumberSeparator(rawColumnData) {
    const numericValuesInColumn = [];
    for (let i = 0; i < rawColumnData.length; i++) {
        const parsedValue = parseFloat(rawColumnData[i] || '');
        if (!isNaN(parsedValue)) {
            numericValuesInColumn.push(parsedValue);
        }
    }
    return Math.max(...numericValuesInColumn) >= 10000 || Math.min(...numericValuesInColumn) <= -10000;
}
function getNumericalValuesByColumn(data, column) {
    return data.map(row => {
        if (!row[column])
            row[column] = null;
        const val = row[column];
        let return_val = null;
        if (typeof val === 'string' && val.match(/^[+-]?\d+(\.\d+)?$/)) {
            return_val = parseFloat(val);
        }
        return return_val;
    });
}
function getCategoricalValuesByColumn(data, column) {
    return data.map(row => {
        if (!row[column])
            row[column] = null;
        return row[column];
    });
}
function getNonNullValues(values) {
    return values.filter(value => value !== null);
}
function getMetaData(values, numberValues, maxDigitsAfterComma) {
    return {
        hasNullValues: values.find(value => value === null) !== undefined,
        hasZeroValues: numberValues.find(value => value === 0) !== undefined,
        maxValue: Math.max(...numberValues),
        minValue: Math.min(...numberValues),
        averageValue: getRoundedAverage(numberValues, maxDigitsAfterComma),
        medianValue: getRoundedMedian(numberValues, maxDigitsAfterComma),
    };
}
function getDataWithoutHeaderRow(data) {
    return data.slice(1);
}
function getUniqueCategoriesCount(data, colorColumn) {
    return getUniqueCategoriesObject(data, colorColumn).categories.length;
}
function getUniqueCategoriesObject(data, colorColumnSettings) {
    const { categoricalOptions, selectedColumn } = colorColumnSettings;
    const customCategoriesOrder = categoricalOptions.customCategoriesOrder;
    let hasNullValues = false;
    let values = [];
    if (typeof selectedColumn === 'number') {
        values = data
            .map(row => row[selectedColumn])
            .filter(value => {
            if (value !== null && value !== '') {
                return true;
            }
            hasNullValues = true;
            return false;
        });
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
function sortValuesByCount(values) {
    // Count how much each value appears.
    const counter = {};
    for (let i = 0; i < values.length; i++) {
        const key = values[i];
        counter[key] = 1 + counter[key] || 1;
    }
    // Sort counter by amount of appearance.
    const sortedCounter = Object.entries(counter).sort((a, b) => b[1] - a[1]);
    // Return only the values. The amount of appearance is not necessary.
    return sortedCounter.map(x => x[0]);
}
function getMaxDigitsAfterCommaInDataByRow(data, rowIndex) {
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
function getDigitsAfterComma(value) {
    const digitsAfterComma = value.split('.');
    if (digitsAfterComma.length > 1) {
        return digitsAfterComma[1].length;
    }
    return 0;
}
function getFormattedValue(value, maxDigitsAfterComma) {
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
    }
    else {
        return formatLocaleSmall.format(formatSpecifier)(value);
    }
}
function getFormattedBuckets(formattingOptions, buckets) {
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
            from: getFormattedValue(from, null),
            to: getFormattedValue(to, null),
            color,
        };
    });
}
function getRoundedValue(value, maxDigitsAfterComma) {
    // Default: round to two digits after comma.
    let roundingFactor = 100;
    // If data contains more precise float numbers we extend
    // each value to max number of digits after comma.
    if (maxDigitsAfterComma !== undefined && maxDigitsAfterComma > 2) {
        roundingFactor = Math.pow(10, maxDigitsAfterComma);
    }
    return Math.round(value * roundingFactor) / roundingFactor;
}
function getCustomBucketBorders(customBuckets) {
    const customBorderStrings = customBuckets.split(',');
    return customBorderStrings.map(value => {
        return parseFloat(value.trim());
    });
}
/**
 * Internal.
 */
function getMedian(values) {
    const middleIndex = Math.floor(values.length / 2);
    const sortedNumbers = [...values].sort((a, b) => a - b);
    if (values.length % 2 !== 0) {
        return sortedNumbers[middleIndex];
    }
    return (sortedNumbers[middleIndex - 1] + sortedNumbers[middleIndex]) / 2;
}
function getRoundedMedian(values, maxDigitsAfterComma) {
    const medianValue = getMedian(values);
    return getRoundedValue(medianValue, maxDigitsAfterComma);
}
function getAverage(values) {
    return values.reduce((a, b) => a + b, 0) / values.length;
}
function getRoundedAverage(values, maxDigitsAfterComma) {
    const averageValue = getAverage(values);
    return getRoundedValue(averageValue, maxDigitsAfterComma);
}

/*
    All colors that are darker than the threshold should be described as white font color.
    We generate a list of the corresponding classes. Further information can be found at:

    https://observablehq.com/d/e40dc4a09badab8a
 */
var colorClassWithLightFontList = [
    's-viz-color-diverging-gender-10-1',
    's-viz-color-diverging-gender-11-1',
    's-viz-color-diverging-gender-12-1',
    's-viz-color-diverging-gender-13-1',
    's-viz-color-diverging-gender-14-1',
    's-viz-color-diverging-gender-7-1',
    's-viz-color-diverging-gender-8-1',
    's-viz-color-diverging-gender-9-1',
    's-viz-color-diverging-three-10-10',
    's-viz-color-diverging-three-11-11',
    's-viz-color-diverging-three-12-11',
    's-viz-color-diverging-three-12-12',
    's-viz-color-diverging-three-13-13',
    's-viz-color-diverging-three-14-13',
    's-viz-color-diverging-three-14-14',
    's-viz-color-diverging-three-2-2',
    's-viz-color-diverging-three-3-3',
    's-viz-color-diverging-three-4-4',
    's-viz-color-diverging-three-5-5',
    's-viz-color-diverging-three-6-6',
    's-viz-color-diverging-three-7-7',
    's-viz-color-diverging-three-8-8',
    's-viz-color-diverging-three-9-9',
    's-viz-color-diverging-two-10-1',
    's-viz-color-diverging-two-11-1',
    's-viz-color-diverging-two-12-1',
    's-viz-color-diverging-two-13-1',
    's-viz-color-diverging-two-14-1',
    's-viz-color-diverging-two-7-1',
    's-viz-color-diverging-two-8-1',
    's-viz-color-diverging-two-9-1',
    's-viz-color-sequential-male-7-1',
    's-viz-color-diverging-gender-10-2',
    's-viz-color-diverging-gender-10-3',
    's-viz-color-diverging-gender-11-2',
    's-viz-color-diverging-gender-11-3',
    's-viz-color-diverging-gender-12-2',
    's-viz-color-diverging-gender-12-3',
    's-viz-color-diverging-gender-13-2',
    's-viz-color-diverging-gender-13-3',
    's-viz-color-diverging-gender-13-4',
    's-viz-color-diverging-gender-14-2',
    's-viz-color-diverging-gender-14-3',
    's-viz-color-diverging-gender-14-4',
    's-viz-color-diverging-gender-7-2',
    's-viz-color-diverging-gender-8-2',
    's-viz-color-diverging-gender-9-2',
    's-viz-color-diverging-gender-9-3',
    's-viz-color-diverging-three-10-9',
    's-viz-color-diverging-three-11-10',
    's-viz-color-diverging-three-13-12',
    's-viz-color-diverging-three-14-12',
    's-viz-color-diverging-three-8-7',
    's-viz-color-diverging-two-10-2',
    's-viz-color-diverging-two-11-2',
    's-viz-color-diverging-two-12-2',
    's-viz-color-diverging-two-13-2',
    's-viz-color-diverging-two-13-3',
    's-viz-color-diverging-two-14-2',
    's-viz-color-diverging-two-14-3',
    's-viz-color-diverging-two-2-1',
    's-viz-color-diverging-two-3-1',
    's-viz-color-diverging-two-4-1',
    's-viz-color-diverging-two-5-1',
    's-viz-color-diverging-two-6-1',
    's-viz-color-diverging-two-7-2',
    's-viz-color-diverging-two-8-2',
    's-viz-color-diverging-two-9-2',
    's-viz-color-sequential-male-5-1',
    's-viz-color-sequential-male-6-1',
    's-viz-color-sequential-male-6-2',
    's-viz-color-sequential-male-7-2',
    's-viz-color-sequential-male-7-3',
    's-viz-color-diverging-three-12-10',
    's-viz-color-diverging-three-13-11',
    's-viz-color-diverging-three-7-6',
    's-viz-color-diverging-three-9-8',
    's-viz-color-diverging-two-11-3',
    's-viz-color-diverging-two-12-3',
    's-viz-color-sequential-two-7-1',
    's-viz-color-diverging-one-10-10',
    's-viz-color-diverging-one-11-11',
    's-viz-color-diverging-one-12-12',
    's-viz-color-diverging-one-13-13',
    's-viz-color-diverging-one-14-14',
    's-viz-color-diverging-one-2-2',
    's-viz-color-diverging-one-3-3',
    's-viz-color-diverging-one-4-4',
    's-viz-color-diverging-one-5-5',
    's-viz-color-diverging-one-6-6',
    's-viz-color-diverging-one-7-7',
    's-viz-color-diverging-one-8-8',
    's-viz-color-diverging-one-9-9',
    's-viz-color-diverging-three-11-9',
    's-viz-color-sequential-female-7-1',
    's-viz-color-sequential-one-2-1',
    's-viz-color-sequential-one-3-1',
    's-viz-color-sequential-one-4-1',
    's-viz-color-sequential-one-5-1',
    's-viz-color-sequential-one-6-1',
    's-viz-color-sequential-one-7-1',
    's-viz-color-sequential-one-7-2',
    's-viz-color-sequential-two-6-1',
    's-viz-color-sequential-two-7-2',
    's-viz-color-diverging-gender-10-10',
    's-viz-color-diverging-gender-11-11',
    's-viz-color-diverging-gender-12-12',
    's-viz-color-diverging-gender-13-13',
    's-viz-color-diverging-gender-14-14',
    's-viz-color-diverging-gender-7-7',
    's-viz-color-diverging-gender-8-8',
    's-viz-color-diverging-gender-9-9',
    's-viz-color-diverging-one-11-10',
    's-viz-color-diverging-one-12-11',
    's-viz-color-diverging-one-13-12',
    's-viz-color-diverging-one-14-13',
    's-viz-color-diverging-three-13-10',
    's-viz-color-diverging-three-9-7',
    's-viz-color-diverging-two-10-10',
    's-viz-color-diverging-two-11-11',
    's-viz-color-diverging-two-12-12',
    's-viz-color-diverging-two-13-4',
    's-viz-color-diverging-two-13-13',
    's-viz-color-diverging-two-14-14',
    's-viz-color-diverging-two-7-7',
    's-viz-color-diverging-two-8-8',
    's-viz-color-diverging-two-9-3',
    's-viz-color-diverging-two-9-9',
    's-viz-color-sequential-one-5-2',
    's-viz-color-sequential-one-6-2',
    's-viz-color-sequential-two-2-1',
    's-viz-color-sequential-two-3-1',
    's-viz-color-sequential-two-4-1',
    's-viz-color-sequential-two-5-1',
    's-viz-color-sequential-two-6-2',
    's-viz-color-sequential-two-7-3',
    's-viz-color-diverging-gender-11-10',
    's-viz-color-diverging-gender-12-11',
    's-viz-color-diverging-gender-13-12',
    's-viz-color-diverging-gender-14-13',
    's-viz-color-diverging-one-10-9',
    's-viz-color-diverging-one-14-12',
    's-viz-color-diverging-one-8-7',
    's-viz-color-diverging-one-9-8',
    's-viz-color-diverging-three-5-4',
    's-viz-color-sequential-female-6-1',
    's-viz-color-sequential-female-7-2',
    's-viz-color-sequential-one-4-2',
    's-viz-color-sequential-one-6-3',
    's-viz-color-sequential-one-7-3',
    's-viz-color-diverging-gender-10-9',
    's-viz-color-diverging-gender-2-2',
    's-viz-color-diverging-gender-3-3',
    's-viz-color-diverging-gender-4-4',
    's-viz-color-diverging-gender-5-5',
    's-viz-color-diverging-gender-6-6',
    's-viz-color-diverging-gender-9-8',
    's-viz-color-diverging-one-11-9',
    's-viz-color-diverging-one-12-10',
    's-viz-color-diverging-one-13-11',
    's-viz-color-diverging-one-7-6',
    's-viz-color-diverging-two-10-9',
    's-viz-color-diverging-two-11-10',
    's-viz-color-diverging-two-12-11',
    's-viz-color-diverging-two-13-12',
    's-viz-color-diverging-two-14-13',
    's-viz-color-diverging-two-9-8',
    's-viz-color-sequential-female-2-1',
    's-viz-color-sequential-female-3-1',
    's-viz-color-sequential-female-4-1',
    's-viz-color-sequential-female-5-1',
    's-viz-color-sequential-one-7-4',
    's-viz-color-diverging-gender-11-9',
    's-viz-color-diverging-gender-12-10',
    's-viz-color-diverging-gender-13-11',
    's-viz-color-diverging-gender-14-12',
    's-viz-color-diverging-gender-7-6',
    's-viz-color-diverging-gender-8-7',
    's-viz-color-diverging-one-13-10',
    's-viz-color-diverging-one-5-4',
    's-viz-color-diverging-one-9-7',
    's-viz-color-diverging-three-10-1',
    's-viz-color-diverging-three-11-1',
    's-viz-color-diverging-three-12-1',
    's-viz-color-diverging-three-13-1',
    's-viz-color-diverging-three-14-1',
    's-viz-color-diverging-three-7-1',
    's-viz-color-diverging-three-8-1',
    's-viz-color-diverging-three-9-1',
    's-viz-color-diverging-two-11-9',
    's-viz-color-diverging-two-12-10',
    's-viz-color-diverging-two-13-11',
    's-viz-color-diverging-two-14-12',
    's-viz-color-diverging-two-7-6',
    's-viz-color-diverging-two-8-7',
    's-viz-color-sequential-female-6-2',
    's-viz-color-sequential-female-7-3',
    's-viz-color-diverging-gender-10-8',
    's-viz-color-diverging-gender-13-10',
    's-viz-color-diverging-gender-14-11',
    's-viz-color-diverging-gender-9-7',
    's-viz-color-diverging-one-10-1',
    's-viz-color-diverging-one-11-1',
    's-viz-color-diverging-one-12-1',
    's-viz-color-diverging-one-13-1',
    's-viz-color-diverging-one-14-1',
    's-viz-color-diverging-one-7-1',
    's-viz-color-diverging-one-8-1',
    's-viz-color-diverging-one-9-1',
    's-viz-color-diverging-two-10-8',
    's-viz-color-diverging-two-13-10',
    's-viz-color-diverging-two-14-11',
    's-viz-color-diverging-two-9-7',
    's-viz-color-diverging-gender-11-8',
    's-viz-color-diverging-three-11-2',
    's-viz-color-diverging-three-12-2',
    's-viz-color-diverging-three-13-2',
    's-viz-color-diverging-three-14-2',
    's-viz-color-sequential-female-4-2',
    's-viz-color-sequential-female-5-2',
    's-viz-color-sequential-female-6-3',
    's-viz-color-sequential-female-7-4',
    's-viz-color-sequential-three-7-1',
    's-viz-color-diverging-one-13-2',
    's-viz-color-diverging-one-14-2',
    's-viz-color-diverging-three-10-2',
    's-viz-color-diverging-three-13-3',
    's-viz-color-diverging-three-2-1',
    's-viz-color-diverging-three-3-1',
    's-viz-color-diverging-three-4-1',
    's-viz-color-diverging-three-5-1',
    's-viz-color-diverging-three-6-1',
    's-viz-color-diverging-three-7-2',
    's-viz-color-diverging-three-9-2',
    's-viz-color-diverging-one-10-2',
    's-viz-color-diverging-one-11-2',
    's-viz-color-diverging-one-12-2',
    's-viz-color-diverging-one-9-2',
    's-viz-color-diverging-three-11-3',
    's-viz-color-diverging-three-12-3',
    's-viz-color-diverging-three-13-4',
    's-viz-color-diverging-three-14-3',
    's-viz-color-diverging-three-8-2',
    's-viz-color-diverging-three-9-3',
    's-viz-color-sequential-three-6-1',
    's-viz-color-sequential-three-7-2',
    's-viz-color-diverging-one-13-3',
    's-viz-color-diverging-one-14-3',
    's-viz-color-diverging-one-2-1',
    's-viz-color-diverging-one-3-1',
    's-viz-color-diverging-one-4-1',
    's-viz-color-diverging-one-5-1',
    's-viz-color-diverging-one-6-1',
    's-viz-color-diverging-one-7-2',
    's-viz-color-diverging-one-8-2',
    's-viz-color-sequential-three-2-1',
    's-viz-color-sequential-three-3-1',
    's-viz-color-sequential-three-4-1',
    's-viz-color-sequential-three-5-1',
    's-viz-color-sequential-three-6-2',
    's-viz-color-sequential-three-7-3',
    's-viz-color-diverging-one-11-3',
    's-viz-color-diverging-one-12-3',
    's-viz-color-diverging-one-13-4',
    's-viz-color-diverging-one-9-3',
    's-viz-color-diverging-one-10-3',
    's-viz-color-diverging-one-14-4',
    's-viz-color-female',
    's-viz-color-one-5',
    's-viz-color-one-7',
    's-viz-color-four-5',
    's-viz-color-four-7',
    's-viz-color-five-5',
    's-viz-color-five-7',
    's-viz-color-seven-5',
    's-viz-color-seven-7',
    's-viz-color-eight-5',
    's-viz-color-eight-7',
    's-viz-color-nine-5',
    's-viz-color-nine-7',
    's-viz-color-eleven-5',
    's-viz-color-eleven-7',
    's-viz-color-darkblue',
    's-viz-color-teal',
    's-viz-color-darkgreen',
    's-viz-color-green',
    's-viz-color-orangered',
    's-viz-color-red',
    's-viz-color-purple',
    's-viz-color-brown',
    's-viz-color-beige',
    's-viz-color-black',
    's-viz-color-grey',
    's-viz-color-nacht',
    's-viz-color-lagune',
    's-viz-color-moos',
    's-viz-color-pesto',
    's-viz-color-sugo',
    's-viz-color-chianti',
    's-viz-color-amethyst',
    's-viz-color-schokolade',
    's-viz-color-sand',
    's-viz-color-aubergine',
    's-viz-color-regen',
    's-viz-color-gray-warm-1',
    's-viz-color-gray-warm-2',
    's-viz-color-gray-warm-3',
    's-viz-color-gray-cool-1',
    's-viz-color-gray-cool-2',
    's-viz-color-gray-cool-3',
    's-viz-color-party-svp-base',
    's-viz-color-party-svp-4',
    's-viz-color-party-svp-5',
    's-viz-color-party-svp-7',
    's-viz-color-party-sp-base',
    's-viz-color-party-sp-4',
    's-viz-color-party-sp-5',
    's-viz-color-party-sp-7',
    's-viz-color-party-fdp-base',
    's-viz-color-party-fdp-5',
    's-viz-color-party-fdp-7',
    's-viz-color-party-cvp-7',
    's-viz-color-party-gps-7',
    's-viz-color-party-glp-7',
    's-viz-color-party-bdp-7',
    's-viz-color-party-evp-7',
    's-viz-color-party-lega-7',
    's-viz-color-party-mcr-base',
    's-viz-color-party-mcr-4',
    's-viz-color-party-mcr-5',
    's-viz-color-party-mcr-7',
    's-viz-color-party-edu-4',
    's-viz-color-party-edu-5',
    's-viz-color-party-edu-7',
    's-viz-color-party-al-5',
    's-viz-color-party-al-7',
    's-viz-color-party-sd-4',
    's-viz-color-party-sd-5',
    's-viz-color-party-sd-7',
    's-viz-color-party-liberale-4',
    's-viz-color-party-liberale-5',
    's-viz-color-party-liberale-7',
    's-viz-color-party-pda-4',
    's-viz-color-party-pda-5',
    's-viz-color-party-pda-7',
    's-viz-color-party-csp-7',
    's-viz-color-party-default-base',
    's-viz-color-party-default-4',
    's-viz-color-party-default-5',
    's-viz-color-party-default-7',
    's-color-gray-7',
    's-color-gray-8',
    's-color-gray-9',
    's-color-primary-4',
    's-color-primary-5',
    's-color-primary-6',
    's-color-primary-7',
    's-color-primary-8',
    's-color-primary-9',
    's-color-secondary-8',
    's-color-secondary-9',
    's-color-negative',
];

const digitWords = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const gray1 = 's-color-gray-1';
// const gray4 = 's-color-gray-4';
// const gray6 = 's-color-gray-6';
// const gray7 = 's-color-gray-7';
// const gray8 = 's-color-gray-8';
const gray9 = 's-color-gray-9';
function getTextColor(customColor, colorClass) {
    if ((customColor === null || customColor === void 0 ? void 0 : customColor.textColor) !== undefined) {
        return customColor.textColor === 'light' ? gray1 : gray9;
    }
    if (colorClassWithLightFontList.indexOf(colorClass) > -1) {
        return gray1;
    }
    return gray9;
}
function getCustomColorMap(colorOverwrites) {
    return new Map(colorOverwrites.map(({ color, position, textColor }) => [position, { color, textColor }]));
}

var LABEL_LEGEND_ID;
(function (LABEL_LEGEND_ID) {
    LABEL_LEGEND_ID["SMALL"] = "small";
    LABEL_LEGEND_ID["MEDIAN"] = "median";
    LABEL_LEGEND_ID["LARGE"] = "large";
    LABEL_LEGEND_ID["AVERAGE"] = "average";
    LABEL_LEGEND_ID["NO_LABEL"] = "noLabel";
})(LABEL_LEGEND_ID || (LABEL_LEGEND_ID = {}));

const methodBoxTextConfig = {
    ckmeans: 'Die unterschiedlich grossen Gruppen kommen durch ein statistisches Verfahren zustande, welches die Werte so in Gruppen einteilt, dass die Unterschiede möglichst gut sichtbar werden (Jenks Natural Breaks).',
    quantile: 'Die Gruppen wurden so gewählt, dass in jeder Gruppe möglichst gleich viele Werte vorhanden sind.',
    equal: 'Die Gruppen wurden so gewählt, dass sie jeweils einen gleich grossen Bereich auf der Skala abdecken.',
    custom: 'Die Gruppen wurden manuell definiert.',
};
function getMethodBoxInfo(bucketType) {
    const methodBoxText = methodBoxTextConfig[bucketType];
    return {
        text: methodBoxText || '',
        article: {
            title: 'Mehr zur Datenberechnung der NZZ',
            url: 'https://www.nzz.ch/ld.1580452',
        },
    };
}

const ckmeans = simpleStatistics.ckmeans;
const quantile = simpleStatistics.quantile;
const widthConfig = {
    [LABEL_LEGEND_ID.SMALL]: 640,
    [LABEL_LEGEND_ID.LARGE]: 100,
    [LABEL_LEGEND_ID.AVERAGE]: 100,
    [LABEL_LEGEND_ID.MEDIAN]: 60,
    [LABEL_LEGEND_ID.NO_LABEL]: 0, // Here to avoid TS linting errors.
};
function getNumericalLegend(selectedColumn, data, colorColumnSettings, formattingOptions, width) {
    const { numericalOptions } = colorColumnSettings;
    const maxDigitsAfterComma = formattingOptions.maxDigitsAfterComma;
    const customColorMap = getCustomColorMap(numericalOptions.colorOverwrites);
    const values = getNumericalValuesByColumn(data, selectedColumn);
    const nonNullValues = getNonNullValues(values);
    const metaData = getMetaData(values, nonNullValues, maxDigitsAfterComma);
    const buckets = getBucketsForLegend(nonNullValues, colorColumnSettings, metaData.minValue, metaData.maxValue, customColorMap, maxDigitsAfterComma);
    const labelLegend = getLabelLegend(numericalOptions.labelLegend, metaData, width, maxDigitsAfterComma);
    const methodBox = getMethodBoxInfo(numericalOptions.bucketType);
    methodBox.formattedBuckets = getFormattedBuckets(formattingOptions, buckets);
    const legend = Object.assign({ buckets, hasSingleValueBucket: hasSingleValueBucket(buckets), type: 'numerical', labelLegend,
        methodBox }, metaData);
    // For all bucket types we calculate the resulting buckets out of a given dataset,
    // custom bucketing need a special handling of min/max values because the first and the last
    // custom bucket value could be lower/higher than min/max.
    if (numericalOptions.bucketType === 'custom') {
        // If first custom bucket value is less than min value in given data set
        // we set min value of legend to starting value of custom buckets.
        const minBucketValue = legend.buckets[0].from;
        if (legend.minValue > minBucketValue) {
            legend.minValue = minBucketValue;
        }
        // iI last custom bucket value is higher that max value in given data set
        // we set max value of legend to last custom bucket value.
        const maxBucketValue = legend.buckets[legend.buckets.length - 1].to;
        if (legend.maxValue < maxBucketValue) {
            legend.maxValue = maxBucketValue;
        }
    }
    return legend;
}
function getCategoricalLegend(data, colorColumnSettings) {
    const { categoricalOptions } = colorColumnSettings;
    const type = 'categorical';
    const customColorMap = getCustomColorMap(categoricalOptions.colorOverwrites);
    const categoryObject = getUniqueCategoriesObject(data, colorColumnSettings);
    const hasNullValues = categoryObject.hasNullValues;
    const categories = [];
    categoryObject.categories.forEach((label, index) => {
        categories.push({
            label,
            color: getCategoryColor(index, customColorMap),
        });
    });
    return {
        hasNullValues,
        type,
        categories,
    };
}
/**
 * Internal.
 */
function getCategoryColor(index, customColorMap) {
    const colorScheme = digitWords[index];
    let colorClass = '';
    // The map starts at index 1 so we have to offset the index by 1.
    const customColor = customColorMap.get(index + 1);
    if (colorScheme) {
        colorClass = `s-viz-color-${colorScheme}-5`;
    }
    return {
        colorClass,
        customColor: customColor !== undefined && customColor.color !== undefined ? customColor.color : '',
        textColor: getTextColor(customColor, colorClass),
    };
}
function getLabelLegend(labelType, metaData, width, maxDigitsAfterComma) {
    if (labelType === LABEL_LEGEND_ID.NO_LABEL)
        return null;
    const { averageValue, minValue, maxValue, medianValue } = metaData;
    const range = maxValue - minValue;
    let position;
    let id;
    let value;
    let descriptionAlignment;
    let label;
    switch (labelType) {
        case LABEL_LEGEND_ID.MEDIAN:
            id = LABEL_LEGEND_ID.MEDIAN;
            position = ((medianValue - minValue) * 100) / range;
            value = getRoundedValue(medianValue, maxDigitsAfterComma);
            descriptionAlignment = getDescriptionAlignment(id, value, position, width, maxDigitsAfterComma);
            label = 'Median';
            break;
        default:
            id = LABEL_LEGEND_ID.AVERAGE;
            position = ((averageValue - minValue) * 100) / range;
            value = averageValue;
            descriptionAlignment = getDescriptionAlignment(id, value, position, width, maxDigitsAfterComma);
            label = 'Durchschnitt';
    }
    return {
        id,
        label,
        value,
        position,
        descriptionAlignment,
    };
}
function hasSingleValueBucket(buckets) {
    const firstBucket = buckets[0];
    return firstBucket.from === firstBucket.to;
}
function getBucketsForLegend(filteredValues, colorColumn, minValue, maxValue, customColorMap, maxDigitsAfterComma) {
    const bucketType = colorColumn.numericalOptions.bucketType;
    const numberBuckets = colorColumn.numericalOptions.numberBuckets;
    const scale = colorColumn.numericalOptions.scale;
    const colorOptions = {
        colorScheme: colorColumn.numericalOptions.colorScheme,
        colorOverwrites: customColorMap,
    };
    if (bucketType === 'ckmeans') {
        return getCkMeansBuckets(filteredValues, numberBuckets, scale, colorOptions);
    }
    else if (bucketType === 'quantile') {
        return getQuantileBuckets(filteredValues, numberBuckets, minValue, scale, colorOptions);
    }
    else if (bucketType === 'equal') {
        return getEqualBuckets(numberBuckets, minValue, maxValue, scale, colorOptions, maxDigitsAfterComma);
    }
    else if (bucketType === 'custom') {
        return getCustomBuckets(colorColumn, scale, colorOptions);
    }
    return [];
}
function getCkMeansBuckets(filteredValues, numberBuckets, scale, colorOptions) {
    const ckmeansBuckets = ckmeans(filteredValues, numberBuckets);
    return ckmeansBuckets.map((bucket, index) => {
        const from = index === 0 ? Math.min(...bucket) : Math.max(...ckmeansBuckets[index - 1]);
        const to = Math.max(...bucket);
        return {
            from,
            to,
            color: getBucketColor(numberBuckets, index, scale, colorOptions),
        };
    });
}
function getQuantileBuckets(filteredValues, numberBuckets, minValue, scale, colorOptions) {
    const quantilePortion = 1 / numberBuckets;
    const quantiles = [];
    for (let i = 1; i <= numberBuckets; i++) {
        quantiles.push(i * quantilePortion);
    }
    const quantileUpperBorders = quantile(filteredValues, quantiles);
    return quantileUpperBorders.map((quantileBorder, index) => {
        const from = index === 0 ? minValue : quantileUpperBorders[index - 1];
        return {
            from,
            to: quantileBorder,
            color: getBucketColor(numberBuckets, index, scale, colorOptions),
        };
    });
}
function getEqualBuckets(numberBuckets, minValue, maxValue, scale, colorOptions, maxDigitsAfterComma) {
    const portion = 1 / numberBuckets;
    const range = maxValue - minValue;
    const equalBuckets = [];
    for (let i = 0; i < numberBuckets; i++) {
        let from = i === 0 ? minValue : minValue + range * portion * i;
        let to = minValue + range * portion * (i + 1);
        // round numbers
        const roundingFactor = Math.pow(10, maxDigitsAfterComma);
        from = Math.round(from * roundingFactor) / roundingFactor;
        to = Math.round(to * roundingFactor) / roundingFactor;
        equalBuckets.push({
            from,
            to,
            color: getBucketColor(numberBuckets, i, scale, colorOptions),
        });
    }
    return equalBuckets;
}
function getCustomBuckets(colorColumnSettings, scale, colorOptions) {
    const { numericalOptions } = colorColumnSettings;
    if (numericalOptions.customBuckets !== undefined) {
        const customBorderValues = getCustomBucketBorders(numericalOptions.customBuckets);
        const numberBuckets = customBorderValues.length - 1;
        const minBorder = customBorderValues.shift() || 0;
        const customBuckets = [];
        customBorderValues.forEach((borderValue, index) => {
            customBuckets.push({
                from: index === 0 ? minBorder : customBorderValues[index - 1],
                to: borderValue,
                color: getBucketColor(numberBuckets, index, scale, colorOptions),
            });
        });
        return customBuckets;
    }
    return [];
}
function getDescriptionAlignment(id, value, position, width, maxDigitsAfterComma) {
    const availableSpaceForLabel = getAvailableSpaceForLabel(position, width);
    const valueLength = getValueLength(value, maxDigitsAfterComma);
    const approxLabelWidth = widthConfig[id] + valueLength * 8;
    if (availableSpaceForLabel < approxLabelWidth) {
        return 'text-align: right;';
    }
    return `margin-left: ${position}%`;
}
function getAvailableSpaceForLabel(position, width) {
    let legendPixelWidth;
    if (width > 640) {
        legendPixelWidth = widthConfig[LABEL_LEGEND_ID.SMALL];
    }
    else {
        legendPixelWidth = (width * widthConfig[LABEL_LEGEND_ID.LARGE]) / 100;
    }
    return (legendPixelWidth * (100 - position)) / 100;
}
function getValueLength(value, maxDigitsAfterComma) {
    return value.toFixed(0).length + maxDigitsAfterComma;
}
function getBucketColor(numberBuckets, index, scale, colorOptions) {
    const colorScheme = colorOptions.colorScheme;
    const customColor = colorOptions.colorOverwrites.get(index);
    let colorClass = '';
    let textColor = '';
    if (scale === 'sequential') {
        colorClass = `s-viz-color-sequential-${colorScheme}-${numberBuckets}-${numberBuckets - index}`;
        textColor = getTextColor(customColor, colorClass);
    }
    else {
        // if we have a diverging scale we deal with two cases:
        // a) diverging value = one of bucket border values,
        //    i.e. we do not have a bucket with a neutral color value
        // b) diverging value = one of the buckets,
        //    i.e. this bucket has a neutral color value
        // scale values could be e.g. border-1, border-2 or bucket-1, bucket-2
        const divergingSpecification = scale.split('-');
        const divergingIndex = parseInt(divergingSpecification[1]);
        // in order to know which diverging scale size we have to use,
        // we have to check which side is bigger first and then calculate
        // the size depending on the number of buckets of the bigger side
        const numberBucketsLeft = divergingIndex;
        let numberBucketsRight = numberBuckets - divergingIndex;
        if (divergingSpecification[0] === 'bucket') {
            numberBucketsRight -= 1;
        }
        const numberBucketsBiggerSide = Math.max(numberBucketsLeft, numberBucketsRight);
        let scaleSize = numberBucketsBiggerSide * 2;
        if (divergingSpecification[0] === 'bucket') {
            scaleSize += 1;
        }
        // if the left side is smaller we cannot start with scale position 1
        // instead we have to calculate the position depending on scale size
        // and number of buckets
        let scalePosition;
        if (numberBucketsLeft < numberBucketsRight) {
            scalePosition = scaleSize - numberBuckets + index + 1;
        }
        else {
            scalePosition = index + 1;
        }
        colorClass = `s-viz-color-diverging-${colorScheme}-${scaleSize}-${scalePosition}`;
        textColor = getTextColor(customColor, colorClass);
    }
    return {
        colorClass,
        customColor: customColor !== undefined && customColor.color !== undefined ? customColor.color : '',
        textColor,
    };
}

function hasCustomBuckets(bucketType) {
    return bucketType === 'custom';
}
function getNumberBuckets(colorColumn) {
    try {
        if (colorColumn.numericalOptions.bucketType !== 'custom') {
            return colorColumn.numericalOptions.numberBuckets;
        }
        else {
            const bucketBorderValues = getCustomBucketBorders(colorColumn.numericalOptions.customBuckets);
            return bucketBorderValues.length - 1; // min value is part of border values and has to be excluded here
        }
    }
    catch (_a) {
        return 0;
    }
}
function getColorColumn(colorColumnAvailable, settings, data, width) {
    if (colorColumnAvailable && typeof (settings === null || settings === void 0 ? void 0 : settings.selectedColumn) === 'number') {
        const selectedColumn = settings.selectedColumn;
        if (settings.colorColumnType === 'numerical') {
            return createNumericalColorColumn(selectedColumn, settings, data, width);
        }
        else {
            return createCategoricalColorColumn(selectedColumn, settings, data);
        }
    }
    return null;
}
function createNumericalColorColumn(selectedColumn, settings, data, width) {
    const maxDigitsAfterComma = getMaxDigitsAfterCommaInDataByRow(data, selectedColumn);
    const roundingBucketBorders = settings.numericalOptions.bucketType !== 'custom';
    const formattingOptions = { maxDigitsAfterComma, roundingBucketBorders };
    const legend = getNumericalLegend(selectedColumn, data, settings, formattingOptions, width);
    const colors = [];
    if (typeof settings.selectedColumn == 'number') {
        const valuesByColumn = getNumericalValuesByColumn(data, settings.selectedColumn);
        valuesByColumn.map(value => {
            const color = getColorForNumericalColoredColoumn(value, legend);
            colors.push(color);
        });
    }
    return Object.assign({ legend,
        colors }, settings);
}
function createCategoricalColorColumn(selectedColumn, settings, data) {
    const legend = getCategoricalLegend(data, settings);
    const categoriesByColumn = getCategoricalValuesByColumn(data, selectedColumn);
    const colors = [];
    categoriesByColumn.map(category => {
        const color = getColorForCategoricalColoredColumn(category, legend);
        colors.push(color);
    });
    return Object.assign({ legend,
        colors }, settings);
}
/**
 * Internal.
 */
function getColorForNumericalColoredColoumn(value, legend) {
    if (typeof value !== 'number') {
        return {
            colorClass: '',
            customColor: '#fff',
            textColor: 's-color-gray-6',
        };
    }
    const buckets = legend.buckets;
    const bucket = buckets.find((bucket, index) => {
        if (index === 0) {
            return value <= bucket.to;
        }
        else if (index === buckets.length - 1) {
            return bucket.from < value;
        }
        else {
            return bucket.from < value && value <= bucket.to;
        }
    });
    if (bucket) {
        return {
            colorClass: bucket.color.colorClass,
            customColor: bucket.color.customColor,
            textColor: bucket.color.textColor,
        };
    }
    else {
        return {
            colorClass: 's-color-gray-4',
            customColor: '',
            textColor: 's-color-gray-6',
        };
    }
}
function getColorForCategoricalColoredColumn(value, legend) {
    if (typeof value !== 'string') {
        return {
            colorClass: '',
            customColor: '#fff',
            textColor: 's-color-gray-6',
        };
    }
    const categories = legend.categories;
    const category = categories.find(category => category.label === value);
    if (category) {
        return {
            colorClass: category.color.colorClass,
            customColor: category.color.customColor,
            textColor: category.color.textColor,
        };
    }
    else {
        return {
            colorClass: 's-color-gray-4',
            customColor: '',
            textColor: '',
        };
    }
}

/**
 * Processes the raw footnote metadata into a structured format.
 * We need this format because not only do we mark footnotes with labels
 * in the table, they will also show up in the footer.
 *
 * Filter: It removes all empty footnotes and also removes
 *         header footnotes if the header is disabled.
 *
 * Sort: Afterwards sorts all footnotes first by row then
 *       by column so they are chronological.
 *
 * Foreach: Mapping the raw meta data to a new format.
 *          Also merge duplicate footnotes into one object.
 */
function getFootnotes(metaData, hideTableHeader) {
    const footnotes = [];
    // Map for quick access for dataformatting cells.
    // The key is rowIndex-colindex.
    // Value is the index of the footnote.
    const footnoteCellMap = new Map();
    metaData
        .filter(cell => {
        // Remove empty footnotes.
        if (!cell.data.footnote || cell.data.footnote === '') {
            return false;
        }
        // Remove header footnotes if the header is disabled.
        if (hideTableHeader && cell.rowIndex === 0) {
            return false;
        }
        return true;
    })
        .sort((a, b) => {
        if (a.rowIndex !== b.rowIndex) {
            return a.rowIndex - b.rowIndex;
        }
        return a.colIndex - b.colIndex;
    }).forEach(cellMetaData => {
        const currentFootnoteText = cellMetaData.data.footnote;
        const existingFootnote = footnotes.find(filterFootnote => currentFootnoteText === filterFootnote.value);
        // We move the index down by -1 so the header row has an index of -1;
        // It is because we split the data between the header and the actual data
        // and we want the actual data to start at 0.
        const rowIndex = cellMetaData.rowIndex - 1;
        const colIndex = cellMetaData.colIndex;
        if (existingFootnote) { // Same footnote given. Merge into one entry.
            footnoteCellMap.set(`${rowIndex}-${colIndex}`, `${existingFootnote.index}`);
        }
        else {
            const index = footnotes.length + 1;
            footnotes.push({
                value: currentFootnoteText,
                index,
            });
            footnoteCellMap.set(`${rowIndex}-${colIndex}`, `${index}`);
        }
    });
    return {
        footnotes,
        footnoteCellMap,
    };
}

var MINIBAR_TYPE;
(function (MINIBAR_TYPE) {
    MINIBAR_TYPE["POSITIVE"] = "positive";
    MINIBAR_TYPE["NEGATIVE"] = "negative";
    MINIBAR_TYPE["MIXED"] = "mixed";
    MINIBAR_TYPE["EMPTY"] = "empty";
})(MINIBAR_TYPE || (MINIBAR_TYPE = {}));
function getMinibar(minibarsAvailable, minibarSettings, columns) {
    if (!minibarSettings)
        return null;
    // A minibar with a columnIndex of null will not be shown.
    const minibar = {
        columnIndex: null,
        values: [],
        type: MINIBAR_TYPE.EMPTY,
        barColor: minibarSettings.barColor,
        settings: minibarSettings,
    };
    // If we actually have valid settings for the minibar we will populate
    // Minibar object with correct values.
    if (minibarsAvailable === true && typeof minibarSettings.selectedColumn === 'number') {
        const column = columns[minibarSettings.selectedColumn];
        const valuesAndType = getMinibarValuesAndType(column);
        minibar.columnIndex = minibarSettings.selectedColumn;
        minibar.type = valuesAndType.minibarType;
        minibar.values = valuesAndType.values;
        checkPositiveBarColor(minibar);
        checkNegativeBarColor(minibar);
        if (minibarSettings.invertColors) {
            invertBarColors(minibar);
        }
    }
    return minibar;
}
function getMinibarValuesAndType(column) {
    let minValue = 0;
    let maxValue = 0;
    let minibarType = MINIBAR_TYPE.MIXED;
    column.forEach(cell => {
        const value = cell.value;
        if (minValue === null || value < minValue) {
            minValue = value;
        }
        if (maxValue === null || value > maxValue) {
            maxValue = value;
        }
    });
    if (minValue <= 0 && maxValue <= 0) {
        minibarType = MINIBAR_TYPE.NEGATIVE;
    }
    else if (minValue >= 0 && maxValue >= 0) {
        minibarType = MINIBAR_TYPE.POSITIVE;
    }
    const values = column.map(cell => {
        return getMinibarValue(minibarType, cell.value, minValue, maxValue);
    });
    return {
        values,
        minibarType,
    };
}
function getMinibarValue(type, value, min, max) {
    if (value === null)
        return 0;
    switch (type) {
        case MINIBAR_TYPE.POSITIVE:
            return Math.abs((value * 100) / max);
        case MINIBAR_TYPE.NEGATIVE:
            return Math.abs((value * 100) / min);
        default:
            return Math.abs((value * 100) / Math.max(Math.abs(min), Math.abs(max)));
    }
}
/**
 * Used in option availability.
 */
function getMinibarNumbersWithType(data, selectedColumnIndex) {
    const minibarsWithType = {
        items: [],
        numbers: [],
        type: MINIBAR_TYPE.MIXED,
    };
    // First row is always header so we add a null entry for it.
    minibarsWithType.items.push({
        value: null,
        type: MINIBAR_TYPE.EMPTY,
    });
    // First row is always header so start at 1.
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const cell = row[selectedColumnIndex];
        const value = parseFloat(cell || '');
        if (isNaN(value)) {
            minibarsWithType.items.push({
                value: null,
                type: MINIBAR_TYPE.EMPTY,
            });
        }
        else {
            const type = getTypeOfValue(value);
            minibarsWithType.numbers.push(value);
            minibarsWithType.items.push({
                value,
                type,
            });
        }
    }
    minibarsWithType.type = getMinibarType(minibarsWithType.numbers);
    return minibarsWithType;
}
function checkPositiveBarColor(minibar) {
    const className = minibar.barColor.positive.className;
    const colorCode = minibar.barColor.positive.colorCode;
    if (className === '' && colorCode === '') {
        minibar.barColor.positive.className = getPositiveColor(minibar.type);
    }
    else if (className !== '') {
        minibar.barColor.positive.colorCode = '';
    }
}
function checkNegativeBarColor(minibar) {
    const className = minibar.barColor.negative.className;
    const colorCode = minibar.barColor.negative.colorCode;
    if (className === '' && colorCode === '') {
        minibar.barColor.negative.className = getNegativeColor(minibar.type);
    }
    else if (className !== '') {
        minibar.barColor.negative.colorCode = '';
    }
}
function invertBarColors(minibar) {
    const temp = minibar.barColor.negative;
    minibar.barColor.negative = minibar.barColor.positive;
    minibar.barColor.positive = temp;
}
function getTypeOfValue(value) {
    if (value < 0) {
        return MINIBAR_TYPE.NEGATIVE;
    }
    if (value > 0) {
        return MINIBAR_TYPE.POSITIVE;
    }
    return MINIBAR_TYPE.EMPTY;
}
function getMinibarType(numbers) {
    const allPositive = numbers.every(number => number >= 0);
    const allNegative = numbers.every(number => number <= 0);
    if (allPositive) {
        return MINIBAR_TYPE.POSITIVE;
    }
    else if (allNegative) {
        return MINIBAR_TYPE.NEGATIVE;
    }
    return MINIBAR_TYPE.MIXED;
}
function getPositiveColor(type) {
    if (type === 'mixed') {
        return 's-viz-color-diverging-2-2';
    }
    return 's-viz-color-one-5';
}
function getNegativeColor(type) {
    if (type === 'mixed') {
        return 's-viz-color-diverging-2-1';
    }
    return 's-viz-color-one-5';
}

var $schema$1 = "http://json-schema.org/draft-07/schema#";
var type$1 = "object";
var title$M = "Tabelle";
var properties$1 = {
	title: {
		title: "Titel",
		type: "string",
		"Q:options": {
			placeholder: "Der Titel bringt die Kernaussage der Tabelle auf den Punkt&#46;"
		}
	},
	subtitle: {
		title: "Untertitel",
		type: "string"
	},
	data: {
		title: "Daten",
		type: "object",
		"Q:type": "table",
		"Q:options": {
			allowTranspose: false,
			metaDataEditor: {
				dataPropertyName: "table",
				features: {
					cells: {
						propertyPath: "metaData.cells"
					}
				}
			}
		},
		properties: {
			table: {
				type: "array",
				items: {
					type: "array",
					items: {
						oneOf: [
							{
								type: "string"
							},
							{
								type: "null"
							}
						]
					}
				},
				minItems: 1
			},
			metaData: {
				type: "object",
				"Q:options": {
					compact: true
				},
				properties: {
					cells: {
						type: "array",
						items: {
							type: "object",
							properties: {
								rowIndex: {
									type: "number",
									"Q:options": {
										hideInEditor: true
									}
								},
								colIndex: {
									type: "number",
									"Q:options": {
										hideInEditor: true
									}
								},
								data: {
									type: "object",
									properties: {
										footnote: {
											title: "Fussnote",
											type: "string"
										}
									}
								}
							}
						}
					}
				}
			}
		}
	},
	sources: {
		title: "Quelle(n)",
		type: "array",
		items: {
			type: "object",
			title: "Quelle",
			properties: {
				text: {
					title: "Quelle",
					type: "string"
				},
				link: {
					"Q:type": "link",
					title: "Link",
					type: "object",
					"Q:options": {
						placeholder: "Direktlink zur Quelle, http://..."
					},
					properties: {
						url: {
							title: "Url",
							type: "string"
						},
						isValid: {
							type: "boolean"
						}
					}
				}
			},
			required: [
				"text"
			]
		}
	},
	notes: {
		title: "Anmerkungen",
		type: "string"
	},
	options: {
		title: "Optionen",
		type: "object",
		properties: {
			pageSize: {
				title: "Zeilen ausblenden nach (Min. = 10)",
				type: "number",
				minimum: 10,
				"default": 10
			},
			frozenRowKey: {
				title: "Zeile einfrieren",
				oneOf: [
					{
						type: "number"
					},
					{
						type: "null"
					}
				],
				"Q:options": {
					dynamicSchema: {
						type: "ToolEndpoint",
						config: {
							endpoint: "dynamic-schema/selectedFrozenRow",
							fields: [
								"data"
							]
						}
					}
				}
			},
			hideTableHeader: {
				title: "Spaltenüberschriften ausblenden",
				type: "boolean",
				"default": false
			},
			showTableSearch: {
				title: "Tabellensuche anzeigen",
				type: "boolean",
				"default": false,
				"Q:options": {
					availabilityChecks: [
						{
							type: "ToolEndpoint",
							config: {
								endpoint: "option-availability/showTableSearch",
								fields: [
									"options",
									"data"
								]
							}
						}
					]
				}
			},
			hideLegend: {
				title: "Legende ausblenden",
				type: "boolean",
				"default": false
			},
			cardLayout: {
				title: "Card-Layout",
				type: "boolean",
				"default": false
			},
			cardLayoutIfSmall: {
				title: "Card-Layout für Mobile",
				type: "boolean",
				"default": false,
				"Q:options": {
					availabilityChecks: [
						{
							type: "ToolEndpoint",
							config: {
								endpoint: "option-availability/cardLayoutIfSmall",
								fields: [
									"options",
									"data"
								]
							}
						}
					]
				}
			},
			formatting: {
				title: "Formatierung",
				type: "array",
				"Q:options": {
					dynamicSchema: {
						type: "ToolEndpoint",
						config: {
							endpoint: "dynamic-schema/getColumnAmount",
							fields: [
								"data"
							]
						}
					},
					layout: "compact"
				},
				items: {
					type: "object",
					properties: {
						column: {
							title: "Zeile",
							oneOf: [
								{
									type: "number"
								}
							],
							"Q:options": {
								dynamicSchema: {
									selectType: "select",
									type: "ToolEndpoint",
									config: {
										endpoint: "dynamic-schema/getEachColumn",
										fields: [
											"data",
											"options"
										]
									}
								}
							}
						},
						formattingType: {
							title: "Formatierung",
							type: "string",
							"default": "light",
							"enum": [
								"country_flags",
								"0",
								"0.00",
								"0.000",
								"0%",
								"0.0%",
								"0.00%",
								"0.000%",
								"arrow_sign_relative_int"
							],
							"Q:options": {
								selectType: "select",
								enum_titles: [
									"country_flags",
									"0",
									"0.00",
									"0.000",
									"0%",
									"0.0%",
									"0.00%",
									"0.000%",
									"(➚➙➘) (+/-)0%"
								]
							}
						}
					}
				}
			},
			sorting: {
				title: "Sortierung",
				type: "array",
				"Q:options": {
					dynamicSchema: {
						type: "ToolEndpoint",
						config: {
							endpoint: "dynamic-schema/getColumnAmount",
							fields: [
								"data"
							]
						}
					},
					layout: "compact",
					sortable: false
				},
				items: {
					type: "object",
					properties: {
						column: {
							title: "Zeile",
							oneOf: [
								{
									type: "number"
								}
							],
							"Q:options": {
								dynamicSchema: {
									selectType: "select",
									type: "ToolEndpoint",
									config: {
										endpoint: "dynamic-schema/getEachColumn",
										fields: [
											"data",
											"options"
										]
									}
								}
							}
						}
					}
				}
			},
			minibar: {
				title: "Minibars",
				type: "object",
				"Q:options": {
					availabilityChecks: [
						{
							type: "ToolEndpoint",
							config: {
								endpoint: "option-availability/minibars",
								fields: [
									"options",
									"data"
								]
							}
						}
					]
				},
				properties: {
					selectedColumn: {
						title: "Spalte auswählen",
						oneOf: [
							{
								type: "number"
							},
							{
								type: "null"
							}
						],
						"Q:options": {
							availabilityChecks: [
								{
									type: "ToolEndpoint",
									config: {
										endpoint: "option-availability/selectedColumnMinibar",
										fields: [
											"options",
											"data"
										]
									}
								}
							],
							dynamicSchema: {
								type: "ToolEndpoint",
								config: {
									endpoint: "dynamic-schema/selectedColumnMinibar",
									fields: [
										"data"
									]
								}
							}
						}
					},
					invertColors: {
						title: "Farben invertieren",
						type: "boolean",
						"default": false,
						"Q:options": {
							availabilityChecks: [
								{
									type: "ToolEndpoint",
									config: {
										endpoint: "option-availability/invertColors",
										fields: [
											"options",
											"data"
										]
									}
								}
							]
						}
					},
					barColor: {
						title: "Farben manuell festlegen",
						type: "object",
						"Q:options": {
							availabilityChecks: [
								{
									type: "UserHasRole",
									config: {
										role: "expert-table"
									}
								},
								{
									type: "ToolEndpoint",
									config: {
										endpoint: "option-availability/barColor",
										fields: [
											"options",
											"data"
										]
									}
								}
							]
						},
						properties: {
							positive: {
								title: "Positive Werte",
								type: "object",
								"Q:options": {
									availabilityChecks: [
										{
											type: "ToolEndpoint",
											config: {
												endpoint: "option-availability/barColorPositive",
												fields: [
													"options",
													"data"
												]
											}
										}
									]
								},
								properties: {
									className: {
										title: "CSS-Klassenname",
										"default": "",
										type: "string",
										"Q:options": {
											placeholder: "s-viz-color-one-5"
										}
									},
									colorCode: {
										title: "Farbcode",
										type: "string",
										"default": "",
										"Q:type": "color"
									}
								}
							},
							negative: {
								title: "Negative Werte",
								type: "object",
								"Q:options": {
									availabilityChecks: [
										{
											type: "ToolEndpoint",
											config: {
												endpoint: "option-availability/barColorNegative",
												fields: [
													"options",
													"data"
												]
											}
										}
									]
								},
								properties: {
									className: {
										title: "CSS-Klassenname",
										"default": "",
										type: "string",
										"Q:options": {
											placeholder: "s-viz-color-two-3"
										}
									},
									colorCode: {
										title: "Farbcode",
										type: "string",
										"default": "",
										"Q:type": "color"
									}
								}
							}
						}
					}
				}
			},
			colorColumn: {
				title: "Einfärben",
				type: "object",
				"Q:options": {
					availabilityChecks: [
						{
							type: "ToolEndpoint",
							config: {
								endpoint: "option-availability/colorColumn",
								fields: [
									"options",
									"data"
								]
							}
						}
					]
				},
				properties: {
					selectedColumn: {
						title: "Spalte auswählen",
						oneOf: [
							{
								type: "number"
							},
							{
								type: "null"
							}
						],
						"Q:options": {
							availabilityChecks: [
								{
									type: "ToolEndpoint",
									config: {
										endpoint: "option-availability/selectedColorColumn",
										fields: [
											"options",
											"data"
										]
									}
								}
							],
							dynamicSchema: {
								type: "ToolEndpoint",
								config: {
									endpoint: "dynamic-schema/selectedColorColumn",
									fields: [
										"data"
									]
								}
							}
						}
					},
					colorColumnType: {
						title: "Einfärbungstyp",
						type: "string",
						"enum": [
							"numerical",
							"categorical"
						],
						"default": "numerical",
						"Q:options": {
							availabilityChecks: [
								{
									type: "ToolEndpoint",
									config: {
										endpoint: "option-availability/colorColumnType",
										fields: [
											"options"
										]
									}
								}
							],
							selectType: "radio",
							enum_titles: [
								"numerisch",
								"kategorisch"
							]
						}
					},
					numericalOptions: {
						title: "Optionen numerische Einfärbung",
						type: "object",
						"Q:options": {
							availabilityChecks: [
								{
									type: "ToolEndpoint",
									config: {
										endpoint: "option-availability/isNumerical",
										fields: [
											"options"
										]
									}
								}
							]
						},
						properties: {
							labelLegend: {
								title: "Mittelwert-Markierung",
								type: "string",
								"default": "noLabel",
								"enum": [
									"noLabel",
									"average",
									"median"
								],
								"Q:options": {
									enum_titles: [
										"ausblenden",
										"zeigt Durchschnitt an",
										"zeigt Median an"
									]
								}
							},
							bucketType: {
								title: "Bucketing Methode",
								type: "string",
								"default": "ckmeans",
								"enum": [
									"ckmeans",
									"quantile",
									"equal",
									"custom"
								],
								"Q:options": {
									availabilityChecks: [
										{
											type: "ToolEndpoint",
											config: {
												endpoint: "option-availability/bucketType",
												fields: [
													"options"
												]
											}
										}
									],
									enum_titles: [
										"Jenks Natural Breaks",
										"Quantile",
										"gleich grosse Intervalle",
										"manuelle Grenzen"
									],
									notificationChecks: [
										{
											type: "ToolEndpoint",
											config: {
												endpoint: "notification/numberBucketsOutOfColorScale",
												fields: [
													"data",
													"options"
												]
											},
											priority: {
												type: "medium",
												value: 2
											}
										}
									]
								}
							},
							customBuckets: {
								title: "Manuelle Bucketgrenzen",
								type: "string",
								"Q:options": {
									placeholder: "z.B. 5, 15, 20, 30",
									availabilityChecks: [
										{
											type: "ToolEndpoint",
											config: {
												endpoint: "option-availability/customBuckets",
												fields: [
													"options"
												]
											}
										}
									],
									notificationChecks: [
										{
											type: "ToolEndpoint",
											config: {
												endpoint: "notification/customBuckets",
												fields: [
													"data",
													"options"
												]
											},
											priority: {
												type: "medium",
												value: 2
											}
										}
									]
								}
							},
							numberBuckets: {
								title: "Anzahl Buckets",
								type: "number",
								"default": 5,
								minimum: 2,
								"Q:options": {
									availabilityChecks: [
										{
											type: "ToolEndpoint",
											config: {
												endpoint: "option-availability/numberBuckets",
												fields: [
													"options"
												]
											}
										}
									],
									notificationChecks: [
										{
											type: "ToolEndpoint",
											config: {
												endpoint: "notification/numberBucketsExceedsDataSet",
												fields: [
													"data",
													"options"
												]
											},
											priority: {
												type: "medium",
												value: 2
											}
										}
									]
								}
							},
							scale: {
								title: "Skala",
								type: "string",
								"Q:options": {
									selectType: "select",
									availabilityChecks: [
										{
											type: "ToolEndpoint",
											config: {
												endpoint: "option-availability/colorScale",
												fields: [
													"options"
												]
											}
										}
									],
									dynamicSchema: {
										type: "ToolEndpoint",
										config: {
											endpoint: "dynamic-schema/colorScale",
											fields: [
												"options"
											]
										}
									}
								},
								"default": "sequential"
							},
							colorScheme: {
								title: "Farbschema",
								type: "string",
								"default": "one",
								"Q:options": {
									selectType: "select",
									dynamicSchema: {
										type: "ToolEndpoint",
										config: {
											endpoint: "dynamic-schema/colorScheme",
											fields: [
												"options"
											]
										}
									},
									availabilityChecks: [
										{
											type: "ToolEndpoint",
											config: {
												endpoint: "option-availability/colorScheme",
												fields: [
													"options"
												]
											}
										}
									]
								}
							},
							colorOverwrites: {
								type: "array",
								title: "Bucketfarbe",
								"Q:options": {
									availabilityChecks: [
										{
											type: "UserHasRole",
											config: {
												role: "expert-table"
											}
										},
										{
											type: "ToolEndpoint",
											config: {
												endpoint: "option-availability/customColors",
												fields: [
													"options"
												]
											}
										}
									],
									dynamicSchema: {
										type: "ToolEndpoint",
										config: {
											endpoint: "dynamic-schema/colorOverwrites",
											fields: [
												"options",
												"data"
											]
										}
									},
									layout: "compact",
									expandable: {
										itemLabelTemplate: "${color}"
									},
									sortable: false
								},
								items: {
									type: "object",
									properties: {
										color: {
											title: "Farbe",
											type: "string",
											"Q:type": "color"
										},
										textColor: {
											title: "Textfarbe",
											type: "string",
											"default": "light",
											"enum": [
												"light",
												"dark"
											],
											"Q:options": {
												selectType: "select",
												enum_titles: [
													"hell",
													"dunkel"
												]
											}
										},
										position: {
											title: "Position",
											oneOf: [
												{
													type: "number"
												},
												{
													type: "null"
												}
											],
											"Q:options": {
												dynamicSchema: {
													selectType: "select",
													type: "ToolEndpoint",
													config: {
														endpoint: "dynamic-schema/colorOverwritesItem",
														fields: [
															"options",
															"data"
														]
													}
												}
											}
										}
									}
								}
							}
						}
					},
					categoricalOptions: {
						title: "Optionen kategorische Einfärbung",
						type: "object",
						"Q:options": {
							availabilityChecks: [
								{
									type: "ToolEndpoint",
									config: {
										endpoint: "option-availability/isCategorical",
										fields: [
											"options"
										]
									}
								}
							],
							notificationChecks: [
								{
									type: "ToolEndpoint",
									config: {
										endpoint: "notification/numberCategoriesOutOfColorScale",
										fields: [
											"data",
											"options"
										]
									},
									priority: {
										type: "medium",
										value: 2
									}
								}
							]
						},
						properties: {
							colorOverwrites: {
								type: "array",
								title: "Kategorienfarbe",
								"Q:options": {
									availabilityChecks: [
										{
											type: "UserHasRole",
											config: {
												role: "expert-table"
											}
										},
										{
											type: "ToolEndpoint",
											config: {
												endpoint: "option-availability/customColors",
												fields: [
													"options"
												]
											}
										}
									],
									dynamicSchema: {
										type: "ToolEndpoint",
										config: {
											endpoint: "dynamic-schema/colorOverwrites",
											fields: [
												"options",
												"data"
											]
										}
									},
									layout: "compact",
									expandable: {
										itemLabelTemplate: "${color} - ${position}"
									},
									sortable: false
								},
								items: {
									type: "object",
									properties: {
										color: {
											title: "Farbe",
											type: "string",
											"Q:type": "color"
										},
										textColor: {
											title: "Textfarbe",
											type: "string",
											"default": "light",
											"enum": [
												"light",
												"dark"
											],
											"Q:options": {
												selectType: "select",
												enum_titles: [
													"hell",
													"dunkel"
												]
											}
										},
										position: {
											title: "Position",
											oneOf: [
												{
													type: "number"
												},
												{
													type: "null"
												}
											],
											"Q:options": {
												dynamicSchema: {
													selectType: "select",
													type: "ToolEndpoint",
													config: {
														endpoint: "dynamic-schema/colorOverwritesItem",
														fields: [
															"options",
															"data"
														]
													}
												}
											}
										}
									}
								}
							},
							customCategoriesOrder: {
								type: "array",
								title: "Reihenfolge Kategorie",
								"Q:options": {
									availabilityChecks: [
										{
											type: "UserHasRole",
											config: {
												role: "expert-table"
											}
										},
										{
											type: "ToolEndpoint",
											config: {
												endpoint: "option-availability/customCategoriesOrder",
												fields: [
													"options"
												]
											}
										}
									],
									dynamicSchema: {
										type: "ToolEndpoint",
										config: {
											endpoint: "dynamic-schema/customCategoriesOrder",
											fields: [
												"data",
												"options"
											]
										}
									},
									layout: "compact",
									sortable: true
								},
								items: {
									type: "object",
									title: "Kategorie",
									properties: {
										category: {
											title: "Kategorie",
											oneOf: [
												{
													type: "null"
												},
												{
													type: "string"
												}
											],
											"Q:options": {
												dynamicSchema: {
													selectType: "select",
													type: "ToolEndpoint",
													config: {
														endpoint: "dynamic-schema/customCategoriesOrderItem",
														fields: [
															"data",
															"options"
														]
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
};
var required = [
	"title",
	"data"
];
var schema$1 = {
	$schema: $schema$1,
	type: type$1,
	title: title$M,
	properties: properties$1,
	required: required
};

const ajv = new Ajv({
    strict: false,
});
const validate = ajv.compile(schema$1);
const route$k = {
    method: 'POST',
    path: '/rendering-info/web',
    options: {
        validate: {
            options: {
                allowUnknown: true,
            },
            payload: payload => {
                const payloadTyped = payload;
                const item = payloadTyped.item;
                const toolRuntimeConfig = payloadTyped.toolRuntimeConfig;
                if (typeof payloadTyped !== 'object' || typeof item !== 'object' || typeof toolRuntimeConfig !== 'object') {
                    throw Boom.badRequest('The given payload for this route is not correct.');
                }
                if (validate(item)) {
                    return new Promise(resolve => {
                        resolve(item);
                    });
                }
                else {
                    throw Boom.badRequest(JSON.stringify(validate.errors));
                }
            },
        },
    },
    handler: function (request) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = createId(request);
            let qtableCompiledScript = '';
            let styleHashMap = null;
            try {
                qtableCompiledScript = readFileSync('dist/Q-Table.js', {
                    encoding: 'utf-8',
                });
            }
            catch (e) {
                console.log('Failed reading compiled Q-Table code - ', e);
            }
            try {
                const rawString = readFileSync('dist/styles/hashMap.json', {
                    encoding: 'utf-8',
                });
                styleHashMap = JSON.parse(rawString);
            }
            catch (e) {
                console.log('Failed reading compiled style hashmap - ', e);
            }
            const payload = request.orig.payload;
            // Extract table configurations.
            const config = payload.item;
            const toolRuntimeConfig = payload.toolRuntimeConfig || {};
            const displayOptions = toolRuntimeConfig.displayOptions || {};
            const options = config.options;
            let colorColumn = null;
            const width = getExactPixelWidth(toolRuntimeConfig);
            const dataWithoutHeaderRow = getDataWithoutHeaderRow(config.data.table);
            const dataLength = dataWithoutHeaderRow.length;
            let tableData = {
                rows: [],
                header: [],
                columns: [],
            };
            // Process options.
            const footnoteObj = getFootnotes(config.data.metaData.cells, options.hideTableHeader);
            const initWithCardLayout = getInitWithCardLayoutFlag(width, options);
            const pageSize = calculatePageSize(dataLength, initWithCardLayout, options, toolRuntimeConfig);
            const minibarsAvailable = yield areMinibarsAvailable(request, config);
            const colorColumnAvailable = yield isColorColumnAvailable(request, config);
            // Most important part.
            // Processing raw data into a format we can use in the front-end.
            try {
                tableData = formatTableData(config.data.table, footnoteObj.footnoteCellMap, options);
            }
            catch (e) {
                // TODO Add logging to Kibana
                console.error('Exception during formatting table data - ', e);
            }
            // Need processed in order to setup the minibar.
            const minibar = getMinibar(minibarsAvailable, options.minibar, tableData.columns);
            try {
                colorColumn = getColorColumn(colorColumnAvailable, options.colorColumn, dataWithoutHeaderRow, width || 0);
            }
            catch (e) {
                // TODO Add logging to Kibana.
                console.error('Exception during creating colorColumn - ', e);
            }
            const props = {
                item: config,
                config,
                tableHead: tableData.header,
                rows: tableData.rows,
                minibar,
                footnotes: footnoteObj.footnotes,
                colorColumn,
                numberOfRows: dataLength,
                displayOptions: displayOptions,
                noInteraction: payload.toolRuntimeConfig.noInteraction || false,
                id,
                width,
                initWithCardLayout,
                pageSize,
                hideTableHeader: options.hideTableHeader,
                frozenRowKey: options.frozenRowKey
            };
            const renderingInfo = {
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
        });
    },
};
function areMinibarsAvailable(request, config) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield request.server.inject({
            url: '/option-availability/selectedColumnMinibar',
            method: 'POST',
            payload: { item: config },
        });
        const result = response.result;
        if (result) {
            return result.available;
        }
        else {
            console.log('Error receiving result for /option-availability/selectedColumnMinibar', result);
            return false;
        }
    });
}
function isColorColumnAvailable(request, config) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield request.server.inject({
            url: '/option-availability/selectedColorColumn',
            method: 'POST',
            payload: { item: config },
        });
        const result = response.result;
        if (result) {
            return result.available;
        }
        else {
            console.log('Error receiving result for /option-availability/selectedColorColumn', result);
            return false;
        }
    });
}
function createId(request) {
    return `q_table_${request.query._id}_${Math.floor(Math.random() * 100000)}`.replace(/-/g, '');
}
function calculatePageSize(totalAmountOfRows, initWithCardLayout, options, toolRuntimeConfig) {
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
function getInitWithCardLayoutFlag(width, options) {
    const { cardLayout, cardLayoutIfSmall } = options;
    if (cardLayout === true) {
        return true;
    }
    if (typeof width === 'number' && width <= 400 && cardLayoutIfSmall === true) {
        return true;
    }
    return false;
}

const __dirname$1 = dirname(fileURLToPath(import.meta.url));
const route$j = {
    method: 'GET',
    path: '/stylesheet/{filename}.{hash}.{extension}',
    options: {
        files: {
            relativeTo: path.join(__dirname$1, '/styles/'),
        },
    },
    handler: function (request, h) {
        const params = request.params;
        // For some reason after updating deps on 7.1.5 ts is not detecting the
        // type of h.file() and is complaining about the return type.
        // @ts-ignore
        // eslint-disable-next-line
        return h.file(`${params.filename}.${params.extension}`)
            .type('text/css')
            .header('cache-control', `max-age=${60 * 60 * 24 * 365}, immutable`); // 1 year
    },
};

var optionAvailability = {
    method: 'POST',
    path: '/option-availability/{optionName}',
    options: {
        validate: {
            payload: Joi.object(),
        },
    },
    handler: function (request) {
        const payload = request.payload;
        const item = payload.item;
        const optionName = request.params.optionName;
        if (optionName === 'cardLayoutIfSmall') {
            return {
                available: !item.options.cardLayout,
            };
        }
        if (optionName === 'showTableSearch') {
            return {
                available: item.data.table.length > 16,
            };
        }
        if (optionName === 'minibars' || optionName === 'selectedColumnMinibar') {
            let isAvailable = false;
            if (item.data.table.length !== 0) {
                if (!item.options.cardLayout && item.data.table[0].length >= 2 && getNumericColumns(item.data.table).length >= 1) {
                    isAvailable = true;
                }
            }
            return {
                available: isAvailable,
            };
        }
        // properties minibar
        if (item.options.minibar !== null && item.options.minibar !== undefined) {
            if (optionName === 'barColor') {
                const isAvailable = item.options.minibar.selectedColumn !== null && item.options.minibar.selectedColumn !== undefined;
                return {
                    available: isAvailable,
                };
            }
            if (optionName === 'barColorPositive') {
                if (typeof item.options.minibar.selectedColumn === 'number') {
                    const type = getMinibarNumbersWithType(item.data.table, item.options.minibar.selectedColumn).type;
                    return {
                        available: type === MINIBAR_TYPE.MIXED || type === MINIBAR_TYPE.POSITIVE,
                    };
                }
            }
            if (optionName === 'barColorNegative') {
                if (typeof item.options.minibar.selectedColumn === 'number') {
                    const type = getMinibarNumbersWithType(item.data.table, item.options.minibar.selectedColumn).type;
                    return {
                        available: type === MINIBAR_TYPE.MIXED || type === MINIBAR_TYPE.NEGATIVE,
                    };
                }
            }
            if (optionName === 'invertColors') {
                if (typeof item.options.minibar.selectedColumn === 'number') {
                    const type = getMinibarNumbersWithType(item.data.table, item.options.minibar.selectedColumn).type;
                    return {
                        available: type === MINIBAR_TYPE.MIXED,
                    };
                }
            }
        }
        if (optionName === 'colorColumn' || optionName === 'selectedColorColumn') {
            let isAvailable = false;
            if (item.data.table.length > 2) {
                if (!item.options.cardLayout && item.data.table[0].length >= 2 && item.data.table.length >= 1) {
                    isAvailable = true;
                }
            }
            return {
                available: isAvailable,
            };
        }
        // properties colorColumn
        if (item.options.colorColumn !== null && item.options.colorColumn !== undefined) {
            if (optionName === 'isNumerical') {
                return {
                    available: item.options.colorColumn.selectedColumn !== null && item.options.colorColumn.colorColumnType === 'numerical',
                };
            }
            if (optionName === 'isCategorical') {
                return {
                    available: item.options.colorColumn.selectedColumn !== null && item.options.colorColumn.colorColumnType === 'categorical',
                };
            }
            if (['colorColumnType', 'bucketType', 'colorScale', 'colorOverwritesItem', 'colorScheme', 'customCategoriesOrder'].includes(optionName)) {
                return {
                    available: item.options.colorColumn.selectedColumn !== null && item.options.colorColumn.selectedColumn !== undefined,
                };
            }
            if (optionName === 'customBuckets') {
                let isAvailable = item.options.colorColumn.selectedColumn !== null && item.options.colorColumn.selectedColumn !== undefined;
                if (isAvailable) {
                    isAvailable = hasCustomBuckets(item.options.colorColumn.numericalOptions.bucketType);
                }
                return {
                    available: isAvailable,
                };
            }
            if (optionName === 'numberBuckets') {
                let isAvailable = item.options.colorColumn.selectedColumn !== null && item.options.colorColumn.selectedColumn !== undefined;
                if (isAvailable) {
                    isAvailable = !hasCustomBuckets(item.options.colorColumn.numericalOptions.bucketType);
                }
                return {
                    available: isAvailable,
                };
            }
            if (optionName === 'customColors') {
                let isAvailable = item.options.colorColumn.selectedColumn !== null && item.options.colorColumn.selectedColumn !== undefined;
                if (isAvailable) {
                    isAvailable = item.options.colorColumn.numericalOptions.scale === 'sequential' || item.options.colorColumn.colorColumnType === 'categorical';
                }
                return {
                    available: isAvailable,
                };
            }
        }
        return Boom.badRequest();
    },
};

const route$i = {
    method: 'POST',
    path: '/dynamic-schema/colorScheme',
    options: {
        validate: {
            payload: Joi.object(),
        },
    },
    handler: function (request) {
        const payload = request.payload;
        const options = payload.item.options;
        const numericalOptions = options.colorColumn.numericalOptions;
        if (numericalOptions.scale === 'sequential') {
            return {
                enum: ['one', 'two', 'three', 'female', 'male'],
                'Q:options': {
                    enum_titles: ['Schema 1 (Standard)', 'Schema 2 (Standard-Alternative)', 'Schema 3 (negative Bedeutung)', 'Schema weiblich', 'Schema männlich'],
                },
            };
        }
        return {
            enum: ['one', 'two', 'three', 'gender'],
            'Q:options': {
                enum_titles: ['Schema 1 (Standard negativ/positiv)', 'Schema 2 (neutral)', 'Schema 3 (Alternative negativ/positiv)', 'Schema weiblich/männlich'],
            },
        };
    },
};

const route$h = {
    method: 'POST',
    path: '/dynamic-schema/colorOverwrites',
    options: {
        validate: {
            payload: Joi.object(),
        },
    },
    handler: function (request) {
        const payload = request.payload;
        const item = payload.item;
        const data = item.data.table;
        const colorColumnSettings = item.options.colorColumn;
        const colorColumnType = colorColumnSettings.colorColumnType;
        if (colorColumnType === 'numerical') {
            return getMaxItemsNumerical(colorColumnSettings);
        }
        else {
            return getMaxItemsCategorical(data, colorColumnSettings);
        }
    },
};
function getMaxItemsNumerical(colorColumnSettings) {
    return {
        maxItems: getNumberBuckets(colorColumnSettings),
    };
}
function getMaxItemsCategorical(data, colorColumnSettings) {
    try {
        data = getDataWithoutHeaderRow(data);
        return {
            maxItems: getUniqueCategoriesCount(data, colorColumnSettings),
        };
    }
    catch (_a) {
        return {
            maxItems: undefined,
        };
    }
}

const route$g = {
    method: 'POST',
    path: '/dynamic-schema/colorOverwritesItem',
    options: {
        validate: {
            payload: Joi.object(),
        },
    },
    handler: function (request) {
        const payload = request.payload;
        const item = payload.item;
        const data = item.data.table;
        const colorColumnSettings = item.options.colorColumn;
        const colorColumnType = colorColumnSettings.colorColumnType;
        if (colorColumnType === 'numerical') {
            return getDropdownSettingsNumerical(colorColumnSettings);
        }
        else {
            return getDropdownSettingsCategorical(data, colorColumnSettings);
        }
    },
};
function getDropdownSettingsNumerical(colorColumnSettings) {
    const ids = [];
    const titles = [];
    const numberItems = getNumberBuckets(colorColumnSettings);
    for (let i = 0; i < numberItems; i++) {
        ids.push(i);
        titles.push(`${i + 1}. Bucket `);
    }
    return {
        enum: ids,
        'Q:options': {
            enum_titles: titles,
        },
    };
}
function getDropdownSettingsCategorical(data, colorColumnSettings) {
    data = getDataWithoutHeaderRow(data);
    const categories = getUniqueCategoriesObject(data, colorColumnSettings).categories;
    const titles = [''];
    const enumValues = [null];
    for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        const id = i + 1;
        const title = `${id} - ${category}`;
        enumValues.push(id);
        titles.push(title);
    }
    return {
        enum: enumValues,
        'Q:options': {
            enum_titles: titles,
        },
    };
}

const route$f = {
    method: 'POST',
    path: '/dynamic-schema/customCategoriesOrder',
    options: {
        validate: {
            payload: Joi.object(),
        },
    },
    handler: function (request) {
        const payload = request.payload;
        const item = payload.item;
        const data = getDataWithoutHeaderRow(item.data.table);
        const colorColumnSettings = item.options.colorColumn;
        return {
            maxItems: getUniqueCategoriesCount(data, colorColumnSettings),
        };
    },
};

const route$e = {
    method: 'POST',
    path: '/dynamic-schema/customCategoriesOrderItem',
    options: {
        validate: {
            payload: Joi.object(),
        },
    },
    handler: function (request) {
        const payload = request.payload;
        const item = payload.item;
        const data = getDataWithoutHeaderRow(item.data.table);
        const colorColumnSettings = item.options.colorColumn;
        const categories = getUniqueCategoriesObject(data, colorColumnSettings).categories;
        return {
            enum: categories,
            'Q:options': {
                enum_titles: categories,
            },
        };
    },
};

const route$d = {
    method: 'POST',
    path: '/dynamic-schema/getColumnAmount',
    options: {
        validate: {
            payload: Joi.object(),
        },
    },
    handler: function (request) {
        const payload = request.payload;
        const item = payload.item;
        const data = item.data.table;
        return {
            maxItems: data[0].length
        };
    },
};

const route$c = {
    method: 'POST',
    path: '/dynamic-schema/getEachColumn',
    options: {
        validate: {
            payload: Joi.object(),
        },
    },
    handler: function (request) {
        const payload = request.payload;
        const item = payload.item;
        const data = item.data.table;
        const ids = [];
        const titles = [];
        for (let i = 0; i < data[0].length; i++) {
            const d = data[0][i];
            ids.push(i);
            titles.push(d);
        }
        return {
            enum: ids,
            'Q:options': {
                enum_titles: titles,
            },
        };
    },
};

const route$b = {
    method: 'POST',
    path: '/dynamic-schema/getOptionsCountryFlagSelect',
    options: {
        validate: {
            payload: Joi.object(),
        },
    },
    handler: function (request) {
        const payload = request.payload;
        const item = payload.item;
        const settings = getOptions(item.data.table);
        return {
            enum: settings.ids,
            'Q:options': {
                enum_titles: settings.titles,
            },
        };
    },
};
/**
 * Internal.
 */
function getOptions(data) {
    // Default setting already added.
    const dropdownSettings = {
        ids: [null],
        titles: ['keine'],
    };
    if (data.length > 0) {
        const columnTypes = getColumnsType(data);
        data[0].forEach((head, index) => {
            if (columnTypes[index].type === 'text') {
                dropdownSettings.ids.push(index);
                dropdownSettings.titles.push(head);
            }
        });
    }
    return dropdownSettings;
}

const route$a = {
    method: 'POST',
    path: '/dynamic-schema/selectedColumnMinibar',
    options: {
        validate: {
            payload: Joi.object(),
        },
    },
    handler: function (request) {
        const payload = request.payload;
        const item = payload.item;
        const settings = getMinibarDropdownSettings(item.data.table);
        return {
            enum: settings.ids,
            'Q:options': {
                enum_titles: settings.titles,
            },
        };
    },
};
/**
 * Internal.
 */
function getMinibarDropdownSettings(data) {
    // Default setting already added.
    const dropdownSettings = {
        ids: [null],
        titles: ['keine'],
    };
    // If data is available we all add all numeric columns to the dropdown.
    if (data.length > 0) {
        const columns = getNumericColumns(data);
        for (let i = 0; i < columns.length; i++) {
            const column = columns[i];
            dropdownSettings.ids.push(column.index);
            dropdownSettings.titles.push(column.title);
        }
    }
    return dropdownSettings;
}

const route$9 = {
    method: 'POST',
    path: '/dynamic-schema/selectedColorColumn',
    options: {
        validate: {
            payload: Joi.object(),
        },
    },
    handler: function (request) {
        const payload = request.payload;
        const item = payload.item;
        const settings = getDropdownSettings(item.data.table);
        return {
            enum: settings.ids,
            'Q:options': {
                enum_titles: settings.titles,
            },
        };
    },
};
/**
 * Internal.
 */
function getDropdownSettings(data) {
    // Default setting already added.
    const dropdownSettings = {
        ids: [null],
        titles: ['keine'],
    };
    // If data is available we all add all numeric columns to the dropdown.
    if (data.length > 0) {
        const columns = getCategoricalColumns(data);
        for (let i = 0; i < columns.length; i++) {
            const column = columns[i];
            dropdownSettings.ids.push(column.index);
            dropdownSettings.titles.push(column.title);
        }
    }
    return dropdownSettings;
}

// TODO Refactor common functionality with selectedColorColum.ts and selectedColumnMinibar.ts
const route$8 = {
    method: 'POST',
    path: '/dynamic-schema/selectedFrozenRow',
    options: {
        validate: {
            payload: Joi.object(),
        },
    },
    handler: function (request) {
        const payload = request.payload;
        const item = payload.item;
        const settings = getFrozenRowDropdownSettings(item.data.table);
        return {
            enum: settings.ids,
            'Q:options': {
                enum_titles: settings.titles,
            },
        };
    },
};
/**
 * Internal.
 */
const getFrozenRowDropdownSettings = (data) => {
    // Default setting already added.
    const dropdownSettings = {
        ids: [null],
        titles: ['keine'],
    };
    // Omit if data only contains a title row
    if (data.length > 1) {
        const [, ...rows] = data;
        dropdownSettings.ids = dropdownSettings.ids.concat(rows.map((d, i) => i));
        dropdownSettings.titles = dropdownSettings.titles.concat(rows.map((d, i) => (i + 2).toString()));
    }
    return dropdownSettings;
};

const route$7 = {
    method: 'POST',
    path: '/dynamic-schema/colorScale',
    options: {
        validate: {
            payload: Joi.object(),
        },
    },
    handler: function (request) {
        const payload = request.payload;
        const item = payload.item;
        const numericalOptions = item.options.colorColumn.numericalOptions;
        const enumValues = ['sequential'];
        const enumTitles = ['Sequentiell'];
        let bucketNumber = 0;
        if (numericalOptions.bucketType === 'custom') {
            if (numericalOptions.customBuckets) {
                const buckets = numericalOptions.customBuckets.split(',');
                bucketNumber = buckets.length - 1;
            }
        }
        else {
            bucketNumber = numericalOptions.numberBuckets;
        }
        // Add valid bucket borders to enum as diverging values.
        for (let i = 1; i < bucketNumber; i++) {
            enumValues.push(`border-${i}`);
            enumTitles.push(`Divergierend ab Grenze ${i}`);
        }
        // Add valid buckets to enum as diverging values.
        for (let i = 1; i < bucketNumber - 1; i++) {
            enumValues.push(`bucket-${i}`);
            enumTitles.push(`Divergierend ab Bucket ${i + 1}`);
        }
        return {
            enum: enumValues,
            'Q:options': {
                enum_titles: enumTitles,
            },
        };
    },
};

const route$6 = {
    method: 'POST',
    path: '/dynamic-schema/sortingDirectionItem',
    options: {
        validate: {
            payload: Joi.object(),
        },
    },
    handler: function () {
        // const payload = request.payload as Payload;
        // const item = payload.item;
        // const data = item.data.table;
        const ids = [null];
        const titles = [''];
        // We only support one column to be auto sorted.
        // But don't know how to make sure the select of the current auto sorted
        // column does not get it's options deleted.
        // This code affects all selects.
        // const m = item.options.sorting?.find(s => s.sortingDirection !== null);
        // if (!m) {
        ids.push('asc', 'desc');
        titles.push('Ascending', 'Decending');
        // }
        return {
            enum: ids,
            'Q:options': {
                enum_titles: titles,
            },
        };
    },
};

var dynamicSchemas = [
    route$i,
    route$h,
    route$g,
    route$f,
    route$e,
    route$d,
    route$c,
    route$b,
    route$9,
    route$a,
    route$8,
    route$7,
    route$6,
];

const route$5 = {
    path: '/health',
    method: 'GET',
    options: {
        tags: ['api'],
    },
    handler: () => {
        return 'ok';
    },
};

function migrate$1(uncastedItem) {
    const item = uncastedItem;
    const result = {
        isChanged: false,
        item: null,
    };
    if (item.options.minibar === undefined) {
        const parsedNumber = parseInt(item.options.minibarOptions || '');
        if (!isNaN(parsedNumber)) {
            const minibars = {
                selectedColumn: parsedNumber + 1,
                barColor: {
                    positive: {
                        className: '',
                        colorCode: '',
                    },
                    negative: {
                        className: '',
                        colorCode: '',
                    },
                },
                invertColors: false,
            };
            item.options['minibar'] = minibars;
            delete item.options.minibarOptions;
            result.isChanged = true;
        }
        else {
            delete item.options.minibarOptions;
            result.isChanged = true;
        }
    }
    result.item = item;
    return result;
}

var migrationToV2 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    migrate: migrate$1
});

function migrate(uncastedItem) {
    const item = uncastedItem;
    const data = item.data;
    const result = {
        isChanged: false,
        item: null,
    };
    let metaData = null;
    if (data && typeof data === 'object' && !Array.isArray(data)) {
        metaData = data.metaData;
    }
    if (metaData === undefined || metaData === null) {
        const castedData = data;
        const slicedData = castedData.slice();
        item.data = {
            table: slicedData,
            metaData: {
                cells: [],
            },
        };
        result.isChanged = true;
    }
    result.item = item;
    return result;
}

var migrationToV3 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    migrate: migrate
});

// register migration scripts here in order of version,
// i.e. list the smallest version first!
const migrationScripts = [migrationToV2, migrationToV3];
const route$4 = {
    method: 'POST',
    path: '/migration',
    options: {
        validate: {
            payload: {
                item: Joi.object().required(),
            },
        },
    },
    handler: (request, h) => {
        const payload = request.payload;
        let item = payload.item;
        const results = migrationScripts.map(script => {
            const result = script.migrate(item);
            if (result.isChanged) {
                item = result.item;
            }
            return result;
        });
        const isChanged = results.findIndex(result => {
            return result.isChanged;
        });
        if (isChanged >= 0) {
            return {
                item: item,
            };
        }
        return h.response().code(304);
    },
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const localesDir = __dirname + '/../../resources/locales/';
const route$3 = {
    path: '/locales/{lng}/translation.json',
    method: 'GET',
    options: {
        description: 'Returns translations for given language',
        tags: ['api'],
        validate: {
            params: {
                lng: Joi.string().required(),
            },
        },
    },
    handler: (request, h) => {
        const params = request.params;
        // For some reason after updating deps on 7.1.5 ts is not detecting the
        // type of h.file() and is complaining about the return type.
        // @ts-ignore
        // eslint-disable-next-line
        return h.file(localesDir + params.lng + '/translation.json').type('application/json');
    },
};

var title$L = "FIXTURE: simple one-column short table with numeric values";
var subtitle$x = "some subtitle here";
var data$K = {
	table: [
		[
			"Land",
			"Punkte"
		],
		[
			"Schweiz",
			"10000000"
		],
		[
			"Deutschland",
			"20000000"
		],
		[
			"Frankreich",
			"355547.5"
		],
		[
			"Österreich",
			"-3500000"
		]
	],
	metaData: {
		cells: [
		]
	}
};
var options$K = {
	cardLayout: false,
	cardLayoutIfSmall: false,
	minibar: {
		invertColors: false,
		barColor: {
			positive: {
				className: "",
				colorCode: ""
			},
			negative: {
				className: "",
				colorCode: ""
			}
		},
		selectedColumn: null
	}
};
var notes$1 = "Anmerkungen";
var sources$K = [
	{
		link: {
		},
		text: "Bloomberg"
	}
];
var twoColumn = {
	title: title$L,
	subtitle: subtitle$x,
	data: data$K,
	options: options$K,
	notes: notes$1,
	sources: sources$K
};

var title$K = "FIXTURE: four column numeric card layout for small";
var subtitle$w = "Subtitle";
var data$J = {
	table: [
		[
			"Kennzahlen",
			"2016",
			"2017",
			"+/-"
		],
		[
			"Umsatz",
			"66.2",
			"70.4",
			"6"
		],
		[
			"Betriebsergebnis Ebit",
			"7.9",
			"",
			"-19"
		],
		[
			"Ebit-Marge (%)",
			"11.9",
			"9.1",
			null
		],
		[
			"Konzernergebnis",
			"6.30",
			"4.10",
			"-35"
		],
		[
			"Cashflow aus Geschäftstätigkeit",
			"8",
			"5.80",
			"-28"
		],
		[
			"Eigenkapitalquote (%)",
			"72.3",
			"71.8",
			null
		],
		[
			"Nettoliquidität",
			"42.30",
			"41.80",
			"-1"
		]
	],
	metaData: {
		cells: [
		]
	}
};
var sources$J = [
];
var options$J = {
	cardLayout: false,
	cardLayoutIfSmall: true,
	minibar: {
		invertColors: false,
		barColor: {
			positive: {
				className: "",
				colorCode: ""
			},
			negative: {
				className: "",
				colorCode: ""
			}
		},
		selectedColumn: null
	}
};
var fourColumn = {
	title: title$K,
	subtitle: subtitle$w,
	data: data$J,
	sources: sources$J,
	options: options$J
};

var title$J = "FIXTURE: four column numeric card layout for small no header";
var subtitle$v = "Subtitle";
var data$I = {
	table: [
		[
			"Kennzahlen",
			"2016",
			"2017",
			"+/-"
		],
		[
			"Umsatz",
			"66.2",
			"70.4",
			"6"
		],
		[
			"Betriebsergebnis Ebit",
			"7.9",
			"6.4",
			"-19"
		],
		[
			"Ebit-Marge (%)",
			"11.9",
			"9.1",
			null
		],
		[
			"Konzernergebnis",
			"6.30",
			"4.10",
			"-35"
		],
		[
			"Cashflow aus Geschäftstätigkeit",
			"8",
			"5.80",
			"-28"
		],
		[
			"Eigenkapitalquote (%)",
			"72.3",
			"71.8",
			null
		],
		[
			"Nettoliquidität",
			"42.30",
			"41.80",
			"-1"
		]
	],
	metaData: {
		cells: [
		]
	}
};
var sources$I = [
];
var options$I = {
	hideTableHeader: true,
	cardLayout: false,
	cardLayoutIfSmall: true,
	minibar: {
		invertColors: false,
		barColor: {
			positive: {
				className: "",
				colorCode: ""
			},
			negative: {
				className: "",
				colorCode: ""
			}
		},
		selectedColumn: null
	}
};
var fourColumnNoHeader = {
	title: title$J,
	subtitle: subtitle$v,
	data: data$I,
	sources: sources$I,
	options: options$I
};

var title$I = "FIXTURE: dates in data";
var data$H = {
	table: [
		[
			"Datum",
			"Ort",
			"Magnitude",
			"Schaden"
		],
		[
			"18.10.1356",
			"Basel",
			"6.6",
			"zerstörend"
		],
		[
			"03.09.1295",
			"Churwalden",
			"6.2",
			"schwer"
		],
		[
			"25.07.1855",
			"Stalden-Visp",
			"6.2",
			"schwer"
		],
		[
			"11.03.1584",
			"Aigle",
			"5.9",
			"schwer"
		],
		[
			"18.09.1601",
			"Unterwalden",
			"5.9",
			"schwer"
		],
		[
			"04.1524",
			"Ardon",
			"5.8",
			"schwer"
		],
		[
			"25.01.1946",
			"Siders",
			"5.8",
			"schwer"
		],
		[
			"09.12.1755",
			"Brig-Naters",
			"5.7",
			"schwer"
		],
		[
			"10.09.1774",
			"Altdorf",
			"5.7",
			"mittel"
		],
		[
			"29.04.1905",
			"Lac d'Emosson",
			"5.5",
			"mittel"
		]
	],
	metaData: {
		cells: [
		]
	}
};
var sources$H = [
	{
		link: {
			url: "http://www.seismo.ethz.ch/de/earthquakes/switzerland/all-earthquakes/",
			isValid: true
		},
		text: "Schweizerischer Erdbebendienst"
	}
];
var options$H = {
	hideTableHeader: false,
	cardLayout: false,
	cardLayoutIfSmall: false,
	minibar: {
		invertColors: false,
		barColor: {
			positive: {
				className: "",
				colorCode: ""
			},
			negative: {
				className: "",
				colorCode: ""
			}
		},
		selectedColumn: null
	}
};
var datesInData = {
	title: title$I,
	data: data$H,
	sources: sources$H,
	options: options$H
};

var title$H = "FIXTURE: mixed number and text in cell";
var subtitle$u = "Opel Insignia Country Tourer 2.0 BiTurbo Diesel";
var data$G = {
	table: [
		[
			"Kennzahl",
			"Wert"
		],
		[
			"Hubraum",
			"1956 ccm"
		],
		[
			"Motorbauart",
			"4 Zyl. Reihe, 2 Turbo, Diesel"
		],
		[
			"Antrieb/Getriebe",
			"AWD/A8"
		],
		[
			"Leistung",
			"154/210 kW/PS"
		]
	],
	metaData: {
		cells: [
		]
	}
};
var sources$G = [
];
var options$G = {
	hideTableHeader: true,
	cardLayout: false,
	cardLayoutIfSmall: false,
	minibar: {
		invertColors: false,
		barColor: {
			positive: {
				className: "",
				colorCode: ""
			},
			negative: {
				className: "",
				colorCode: ""
			}
		},
		selectedColumn: null
	}
};
var mixedNumbersAndTextInCell = {
	title: title$H,
	subtitle: subtitle$u,
	data: data$G,
	sources: sources$G,
	options: options$G
};

var title$G = "FIXTURE: hyphen sign as number";
var subtitle$t = "Subtitle";
var data$F = {
	table: [
		[
			"",
			"2016",
			"2017",
			"+/- %"
		],
		[
			"Auftragseingang",
			"10375",
			"10989",
			"6"
		],
		[
			"Umsatz",
			"9683",
			"10178",
			"5"
		],
		[
			"Ebit-Mage (%)",
			"11.7",
			"11.7",
			"-"
		],
		[
			"Cashflow aus Geschäftstätigkeite",
			"929",
			"810",
			"-13"
		]
	],
	metaData: {
		cells: [
		]
	}
};
var sources$F = [
];
var options$F = {
	cardLayout: false,
	cardLayoutIfSmall: true,
	minibar: {
		invertColors: false,
		barColor: {
			positive: {
				className: "",
				colorCode: ""
			},
			negative: {
				className: "",
				colorCode: ""
			}
		},
		selectedColumn: null
	},
	showTableSearch: true
};
var hyphenSignAsNumber = {
	title: title$G,
	subtitle: subtitle$t,
	data: data$F,
	sources: sources$F,
	options: options$F
};

var title$F = "FIXTURE: multiline text";
var subtitle$s = "";
var data$E = {
	table: [
		[
			"",
			"GFK",
			"Subsidiär"
		],
		[
			"Zahl 2017",
			"119560",
			"98156"
		],
		[
			"Definition",
			"Verfolgt aufgrund von Rasse, Nationalität, politischer Überzeugung, Religion, sexueller Orientierung",
			"Tod, Folter oder massive Gewalt drohen bei Rückkehr. Status ist aber nicht an Verfolung geknüpft"
		],
		[
			"Regelung Familiennachzug",
			"Unbeschränkt über Visa möglich",
			"Künftig sollen 100 Angehörige pro Monat nachziehen dürfen. Härtefälle sind von dieser Regelung ausgenommen."
		]
	],
	metaData: {
		cells: [
		]
	}
};
var sources$E = [
];
var options$E = {
	hideTableHeader: false,
	cardLayout: false,
	cardLayoutIfSmall: true,
	minibar: {
		invertColors: false,
		barColor: {
			positive: {
				className: "",
				colorCode: ""
			},
			negative: {
				className: "",
				colorCode: ""
			}
		},
		selectedColumn: null
	}
};
var multilineText = {
	title: title$F,
	subtitle: subtitle$s,
	data: data$E,
	sources: sources$E,
	options: options$E
};

var title$E = "FIXTURE: show more button";
var data$D = {
	table: [
		[
			"State",
			"All Deaths",
			"Total"
		],
		[
			"Lousiana",
			"996",
			"473"
		],
		[
			"Pennslyvania",
			"4627",
			"2075"
		],
		[
			"Alabama",
			"756",
			"308"
		],
		[
			"Montana",
			"119",
			"46"
		],
		[
			"Indiana",
			"1526",
			"547"
		],
		[
			"Delaware",
			"282",
			"99"
		],
		[
			"Nebraska",
			"120",
			"37"
		],
		[
			"Arkansas",
			"401",
			"115"
		],
		[
			"Florida",
			"4728",
			"1144"
		],
		[
			"Idaho",
			"243",
			"55"
		],
		[
			"New Jersey",
			"2056",
			"461"
		],
		[
			"Mississippi",
			"352",
			"78"
		],
		[
			"Wyoming",
			"99",
			"21"
		],
		[
			"California",
			"4654",
			"930"
		],
		[
			"Kansas",
			"313",
			"62"
		],
		[
			"Colorado",
			"942",
			"172"
		],
		[
			"Kentucky",
			"1419",
			"253"
		],
		[
			"Missouri",
			"1371",
			"199"
		],
		[
			"North Dakota",
			"77",
			"11"
		],
		[
			"Arizona",
			"1382",
			"196"
		],
		[
			"Minnesota",
			"672",
			"93"
		],
		[
			"Michigan",
			"2347",
			"309"
		],
		[
			"Texas",
			"2831",
			"370"
		],
		[
			"Tennessee",
			"1630",
			"136"
		],
		[
			"Iowa",
			"314",
			"26"
		],
		[
			"Georgia",
			"1394",
			"103"
		],
		[
			"Washington",
			"1102",
			"75"
		],
		[
			"Hawaii",
			"191",
			"12"
		],
		[
			"Wisconsin",
			"1074",
			"56"
		],
		[
			"Utah",
			"635",
			"33"
		],
		[
			"Ohio",
			"4329",
			"216"
		],
		[
			"Oregon",
			"506",
			"24"
		],
		[
			"Oklahoma",
			"813",
			"37"
		],
		[
			"South Dakota",
			"69",
			"3"
		],
		[
			"Illinois",
			"2411",
			"102"
		],
		[
			"South Carolina",
			"879",
			"35"
		],
		[
			"West Virginia",
			"884",
			"32"
		],
		[
			"North Carolina",
			"1956",
			"68"
		],
		[
			"New Mexico",
			"500",
			"16"
		],
		[
			"Nevada",
			"665",
			"19"
		],
		[
			"New York",
			"3.638",
			"97"
		],
		[
			"Virginia",
			"1405",
			"34"
		],
		[
			"Vermont",
			"125",
			"3"
		],
		[
			"Maryland",
			"2044",
			"42"
		],
		[
			"Alaska",
			"128",
			"2"
		],
		[
			"Maine",
			"353",
			"5"
		],
		[
			"Massachusetts",
			"2227",
			"29"
		],
		[
			"New Hampshire",
			"481",
			"5"
		],
		[
			"Washington, D.C",
			"269",
			"2"
		],
		[
			"Connecticut",
			"971",
			"7"
		],
		[
			"Rhode Island",
			"326",
			"1"
		]
	],
	metaData: {
		cells: [
		]
	}
};
var sources$D = [
	{
		link: {
		},
		text: "The Centers for Disease Control and Prevention"
	}
];
var options$D = {
	hideTableHeader: false,
	cardLayout: false,
	cardLayoutIfSmall: true,
	minibar: {
		invertColors: false,
		barColor: {
			positive: {
				className: "",
				colorCode: ""
			},
			negative: {
				className: "",
				colorCode: ""
			}
		},
		selectedColumn: null
	}
};
var tool$k = "table";
var subtitle$r = "State by state breakdown";
var showMoreButton = {
	title: title$E,
	data: data$D,
	sources: sources$D,
	options: options$D,
	tool: tool$k,
	subtitle: subtitle$r
};

var title$D = "FIXTURE: pagination";
var data$C = {
	table: [
		[
			"State",
			"All Deaths",
			"Total"
		],
		[
			"Lousiana",
			"996",
			"473"
		],
		[
			"Pennslyvania",
			"4627",
			"2075"
		],
		[
			"Alabama",
			"756",
			"308"
		],
		[
			"Montana",
			"119",
			"46"
		],
		[
			"Indiana",
			"1526",
			"547"
		],
		[
			"Delaware",
			"282",
			"99"
		],
		[
			"Nebraska",
			"120",
			"37"
		],
		[
			"Arkansas",
			"401",
			"115"
		],
		[
			"Florida",
			"4728",
			"1144"
		],
		[
			"Idaho",
			"243",
			"55"
		],
		[
			"New Jersey",
			"2056",
			"461"
		],
		[
			"Mississippi",
			"352",
			"78"
		],
		[
			"Wyoming",
			"99",
			"21"
		],
		[
			"California",
			"4654",
			"930"
		],
		[
			"Kansas",
			"313",
			"62"
		],
		[
			"Colorado",
			"942",
			"172"
		],
		[
			"Kentucky",
			"1419",
			"253"
		],
		[
			"Missouri",
			"1371",
			"199"
		],
		[
			"North Dakota",
			"77",
			"11"
		],
		[
			"Arizona",
			"1382",
			"196"
		],
		[
			"Minnesota",
			"672",
			"93"
		],
		[
			"Michigan",
			"2347",
			"309"
		],
		[
			"Texas",
			"2831",
			"370"
		],
		[
			"Tennessee",
			"1630",
			"136"
		],
		[
			"Iowa",
			"314",
			"26"
		],
		[
			"Georgia",
			"1394",
			"103"
		],
		[
			"Washington",
			"1102",
			"75"
		],
		[
			"Hawaii",
			"191",
			"12"
		],
		[
			"Wisconsin",
			"1074",
			"56"
		],
		[
			"Utah",
			"635",
			"33"
		],
		[
			"Ohio",
			"4329",
			"216"
		],
		[
			"Oregon",
			"506",
			"24"
		],
		[
			"Oklahoma",
			"813",
			"37"
		],
		[
			"South Dakota",
			"69",
			"3"
		],
		[
			"Illinois",
			"2411",
			"102"
		],
		[
			"South Carolina",
			"879",
			"35"
		],
		[
			"West Virginia",
			"884",
			"32"
		],
		[
			"North Carolina",
			"1956",
			"68"
		],
		[
			"New Mexico",
			"500",
			"16"
		],
		[
			"Nevada",
			"665",
			"19"
		],
		[
			"New York",
			"3.638",
			"97"
		],
		[
			"Virginia",
			"1405",
			"34"
		],
		[
			"Vermont",
			"125",
			"3"
		],
		[
			"Maryland",
			"2044",
			"42"
		],
		[
			"Alaska",
			"128",
			"2"
		],
		[
			"Maine",
			"353",
			"5"
		],
		[
			"Massachusetts",
			"2227",
			"29"
		],
		[
			"New Hampshire",
			"481",
			"5"
		],
		[
			"Washington, D.C",
			"269",
			"2"
		],
		[
			"Connecticut",
			"971",
			"7"
		],
		[
			"Rhode Island",
			"326",
			"1"
		]
	],
	metaData: {
		cells: [
		]
	}
};
var sources$C = [
	{
		link: {
		},
		text: "The Centers for Disease Control and Prevention"
	}
];
var options$C = {
	usePagination: true,
	pageSize: 10,
	hideTableHeader: false,
	cardLayout: false,
	cardLayoutIfSmall: true,
	minibar: {
		invertColors: false,
		barColor: {
			positive: {
				className: "",
				colorCode: ""
			},
			negative: {
				className: "",
				colorCode: ""
			}
		},
		selectedColumn: null
	}
};
var tool$j = "table";
var subtitle$q = "State by state breakdown";
var pagination = {
	title: title$D,
	data: data$C,
	sources: sources$C,
	options: options$C,
	tool: tool$j,
	subtitle: subtitle$q
};

var title$C = "FIXTURE: frozenRow";
var data$B = {
	table: [
		[
			"State",
			"All Deaths",
			"Total"
		],
		[
			"Lousiana",
			"996",
			"473"
		],
		[
			"Pennslyvania",
			"4627",
			"2075"
		],
		[
			"Alabama",
			"756",
			"308"
		],
		[
			"Montana",
			"119",
			"46"
		],
		[
			"Indiana",
			"1526",
			"547"
		],
		[
			"Delaware",
			"282",
			"99"
		],
		[
			"Nebraska",
			"120",
			"37"
		],
		[
			"Arkansas",
			"401",
			"115"
		],
		[
			"Florida",
			"4728",
			"1144"
		],
		[
			"Idaho",
			"243",
			"55"
		],
		[
			"New Jersey",
			"2056",
			"461"
		],
		[
			"Mississippi",
			"352",
			"78"
		],
		[
			"Wyoming",
			"99",
			"21"
		],
		[
			"California",
			"4654",
			"930"
		],
		[
			"Kansas",
			"313",
			"62"
		],
		[
			"Colorado",
			"942",
			"172"
		],
		[
			"Kentucky",
			"1419",
			"253"
		],
		[
			"Missouri",
			"1371",
			"199"
		],
		[
			"North Dakota",
			"77",
			"11"
		],
		[
			"Arizona",
			"1382",
			"196"
		],
		[
			"Minnesota",
			"672",
			"93"
		],
		[
			"Michigan",
			"2347",
			"309"
		],
		[
			"Texas",
			"2831",
			"370"
		],
		[
			"Tennessee",
			"1630",
			"136"
		],
		[
			"Iowa",
			"314",
			"26"
		],
		[
			"Georgia",
			"1394",
			"103"
		],
		[
			"Washington",
			"1102",
			"75"
		],
		[
			"Hawaii",
			"191",
			"12"
		],
		[
			"Wisconsin",
			"1074",
			"56"
		],
		[
			"Utah",
			"635",
			"33"
		],
		[
			"Ohio",
			"4329",
			"216"
		],
		[
			"Oregon",
			"506",
			"24"
		],
		[
			"Oklahoma",
			"813",
			"37"
		],
		[
			"South Dakota",
			"69",
			"3"
		],
		[
			"Illinois",
			"2411",
			"102"
		],
		[
			"South Carolina",
			"879",
			"35"
		],
		[
			"West Virginia",
			"884",
			"32"
		],
		[
			"North Carolina",
			"1956",
			"68"
		],
		[
			"New Mexico",
			"500",
			"16"
		],
		[
			"Nevada",
			"665",
			"19"
		],
		[
			"New York",
			"3.638",
			"97"
		],
		[
			"Virginia",
			"1405",
			"34"
		],
		[
			"Vermont",
			"125",
			"3"
		],
		[
			"Maryland",
			"2044",
			"42"
		],
		[
			"Alaska",
			"128",
			"2"
		],
		[
			"Maine",
			"353",
			"5"
		],
		[
			"Massachusetts",
			"2227",
			"29"
		],
		[
			"New Hampshire",
			"481",
			"5"
		],
		[
			"Washington, D.C",
			"269",
			"2"
		],
		[
			"Connecticut",
			"971",
			"7"
		],
		[
			"Rhode Island",
			"326",
			"1"
		]
	],
	metaData: {
		cells: [
		]
	}
};
var sources$B = [
	{
		link: {
		},
		text: "The Centers for Disease Control and Prevention"
	}
];
var options$B = {
	usePagination: true,
	pageSize: 10,
	frozenRowKey: 4,
	hideTableHeader: false,
	cardLayout: false,
	cardLayoutIfSmall: true,
	minibar: {
		invertColors: false,
		barColor: {
			positive: {
				className: "",
				colorCode: ""
			},
			negative: {
				className: "",
				colorCode: ""
			}
		},
		selectedColumn: null
	}
};
var tool$i = "table";
var subtitle$p = "State by state breakdown";
var frozenRow = {
	title: title$C,
	data: data$B,
	sources: sources$B,
	options: options$B,
	tool: tool$i,
	subtitle: subtitle$p
};

var title$B = "FIXTURE: disapprearing columns";
var data$A = {
	table: [
		[
			"",
			"Homoicide2",
			"Suicide",
			"Unitentical",
			"Determined"
		],
		[
			"2004",
			"996",
			"473",
			"12331",
			"12311"
		],
		[
			"2005",
			"4627",
			"2075",
			"14598",
			"17812"
		],
		[
			"2006",
			"756",
			"308",
			"1231",
			"12311"
		],
		[
			"2007",
			"119",
			"46",
			"5432",
			"1234"
		],
		[
			"2008",
			"1526",
			"547",
			"3526",
			"6745"
		],
		[
			"2009",
			"282",
			"99",
			"3245",
			"1902"
		],
		[
			"2010",
			"120",
			"37",
			"9824",
			"4358"
		],
		[
			"2011",
			"401",
			"115",
			"23458",
			"4278"
		],
		[
			"2012",
			"4728",
			"1144",
			"2147",
			"34258"
		],
		[
			"2013",
			"243",
			"55",
			"2478",
			"3487"
		],
		[
			"2014",
			"2056",
			"461",
			"7343",
			"2834"
		],
		[
			"2015",
			"352",
			"78",
			"9832",
			"2348"
		],
		[
			"2016",
			"99",
			"21",
			"23978",
			"3492"
		],
		[
			"Annual Average",
			"4654",
			"930",
			"4389",
			"18704"
		],
		[
			"Daily Average",
			"313",
			"62",
			"3289",
			"93248"
		]
	],
	metaData: {
		cells: [
		]
	}
};
var sources$A = [
	{
		link: {
		},
		text: "The Centers for Disease Control and Prevention"
	}
];
var options$A = {
	hideTableHeader: false,
	cardLayout: true,
	cardLayoutIfSmall: true,
	minibar: {
		invertColors: false,
		barColor: {
			positive: {
				className: "",
				colorCode: ""
			},
			negative: {
				className: "",
				colorCode: ""
			}
		},
		selectedColumn: null
	}
};
var tool$h = "table";
var subtitle$o = "State by state breakdown";
var disappearingColumns = {
	title: title$B,
	data: data$A,
	sources: sources$A,
	options: options$A,
	tool: tool$h,
	subtitle: subtitle$o
};

var title$A = "FIXTURE: column spacing";
var data$z = {
	table: [
		[
			"Burglind",
			"km/h",
			"Lothar",
			"km/h"
		],
		[
			"Gütsch ob Andermatt",
			"201",
			"Säntis",
			"230"
		],
		[
			"Pilatus",
			"195",
			"Hörnli",
			"208"
		],
		[
			"Chaseral",
			"184",
			"La Dôle",
			"201"
		],
		[
			"Crap Masegn",
			"179",
			"Delémont",
			"170"
		]
	],
	metaData: {
		cells: [
		]
	}
};
var sources$z = [
	{
		link: {
		},
		text: "The Centers for Disease Control and Prevention"
	}
];
var options$z = {
	hideTableHeader: false,
	cardLayout: false,
	cardLayoutIfSmall: false,
	minibar: {
		invertColors: false,
		barColor: {
			positive: {
				className: "",
				colorCode: ""
			},
			negative: {
				className: "",
				colorCode: ""
			}
		},
		selectedColumn: null
	}
};
var tool$g = "table";
var subtitle$n = "State by state breakdown";
var columnSpacing = {
	title: title$A,
	data: data$z,
	sources: sources$z,
	options: options$z,
	tool: tool$g,
	subtitle: subtitle$n
};

var title$z = "FIXTURE: minibars with positive and negative values";
var data$y = {
	table: [
		[
			"",
			"2016",
			"2017",
			"+/- %"
		],
		[
			"Auftragseingang",
			"10375",
			"10989",
			"6"
		],
		[
			"Umsatz",
			"9683",
			"10178",
			"5"
		],
		[
			"Ebit-Mage (%)",
			"11.7",
			"11.7",
			"-"
		],
		[
			"Cashflow aus Geschäftstätigkeite",
			"929",
			"810",
			"-13"
		]
	],
	metaData: {
		cells: [
		]
	}
};
var sources$y = [
	{
		link: {
		},
		text: "The Centers for Disease Control and Prevention"
	}
];
var options$y = {
	hideTableHeader: false,
	cardLayout: false,
	cardLayoutIfSmall: true,
	minibar: {
		selectedColumn: 3,
		barColor: {
			positive: {
				className: "",
				colorCode: ""
			},
			negative: {
				className: "",
				colorCode: ""
			}
		}
	}
};
var tool$f = "table";
var subtitle$m = "State by state breakdown";
var minibarsMixed = {
	title: title$z,
	data: data$y,
	sources: sources$y,
	options: options$y,
	tool: tool$f,
	subtitle: subtitle$m
};

var title$y = "FIXTURE: minibars with positive values";
var data$x = {
	table: [
		[
			"",
			"2016",
			"2017",
			"+/- %"
		],
		[
			"Auftragseingang",
			"10375",
			"10989",
			"6"
		],
		[
			"Umsatz",
			"9683",
			"10178",
			"5"
		],
		[
			"Ebit-Mage (%)",
			"11.7",
			"11.7",
			"-"
		],
		[
			"Cashflow aus Geschäftstätigkeite",
			"929",
			"810",
			"13"
		]
	],
	metaData: {
		cells: [
		]
	}
};
var sources$x = [
	{
		link: {
		},
		text: "The Centers for Disease Control and Prevention"
	}
];
var options$x = {
	hideTableHeader: false,
	cardLayout: false,
	cardLayoutIfSmall: true,
	minibar: {
		selectedColumn: 3,
		barColor: {
			positive: {
				className: "",
				colorCode: ""
			},
			negative: {
				className: "",
				colorCode: ""
			}
		}
	}
};
var tool$e = "table";
var subtitle$l = "State by state breakdown";
var minibarsPositive = {
	title: title$y,
	data: data$x,
	sources: sources$x,
	options: options$x,
	tool: tool$e,
	subtitle: subtitle$l
};

var title$x = "FIXTURE: minibars with negative values";
var data$w = {
	table: [
		[
			"",
			"2016",
			"2017",
			"+/- %"
		],
		[
			"Auftragseingang",
			"10375",
			"10989",
			"-6"
		],
		[
			"Umsatz",
			"9683",
			"10178",
			"-5"
		],
		[
			"Ebit-Mage (%)",
			"11.7",
			"11.7",
			"-"
		],
		[
			"Cashflow aus Geschäftstätigkeite",
			"929",
			"810",
			"-13"
		]
	],
	metaData: {
		cells: [
		]
	}
};
var sources$w = [
	{
		link: {
		},
		text: "The Centers for Disease Control and Prevention"
	}
];
var options$w = {
	hideTableHeader: false,
	cardLayout: false,
	cardLayoutIfSmall: true,
	minibar: {
		selectedColumn: 3,
		barColor: {
			positive: {
				className: "",
				colorCode: ""
			},
			negative: {
				className: "",
				colorCode: ""
			}
		}
	}
};
var tool$d = "table";
var subtitle$k = "State by state breakdown";
var minibarsNegative = {
	title: title$x,
	data: data$w,
	sources: sources$w,
	options: options$w,
	tool: tool$d,
	subtitle: subtitle$k
};

var title$w = "FIXTURE: minibars with numbers as headers";
var data$v = {
	table: [
		[
			null,
			"2017",
			"2016",
			"2007"
		],
		[
			"Luzern",
			"4.7",
			"4.7",
			"4.8"
		],
		[
			"Uri",
			"2.2",
			"2.7",
			"1.6"
		],
		[
			"Schwyz",
			"2.4",
			"2.3",
			"2.2"
		],
		[
			"Obwalden",
			"3.1",
			"3.4",
			"2.6"
		],
		[
			"Nidwalden",
			"3.9",
			"4.4",
			"2.0"
		],
		[
			"Zug",
			"3.9",
			"4.7",
			"4.9"
		],
		[
			"Zentralschweiz",
			"3.9",
			"4.1",
			"3.9"
		],
		[
			"Schweiz",
			"6.3",
			"6.4",
			"6.9"
		]
	],
	metaData: {
		cells: [
		]
	}
};
var sources$v = [
	{
		link: {
		},
		text: "The Centers for Disease Control and Prevention"
	}
];
var options$v = {
	hideTableHeader: false,
	cardLayout: false,
	cardLayoutIfSmall: true,
	minibar: {
		selectedColumn: 2,
		barColor: {
			positive: {
				className: "",
				colorCode: "#c0c0c0"
			},
			negative: {
				className: "",
				colorCode: "#ff7e79"
			}
		}
	}
};
var tool$c = "table";
var subtitle$j = "State by state breakdown";
var minibarsHeaderWithNumbers = {
	title: title$w,
	data: data$v,
	sources: sources$v,
	options: options$v,
	tool: tool$c,
	subtitle: subtitle$j
};

var title$v = "FIXTURE: mixed minibars with custom colors (className)";
var data$u = {
	table: [
		[
			"",
			"2016",
			"2017",
			"+/- %"
		],
		[
			"Auftragseingang",
			"10375",
			"10989",
			"6"
		],
		[
			"Umsatz",
			"9683",
			"10178",
			"5"
		],
		[
			"Ebit-Mage (%)",
			"11.7",
			"11.7",
			"-"
		],
		[
			"Cashflow aus Geschäftstätigkeite",
			"929",
			"810",
			"-13"
		]
	],
	metaData: {
		cells: [
		]
	}
};
var sources$u = [
	{
		link: {
		},
		text: "The Centers for Disease Control and Prevention"
	}
];
var options$u = {
	hideTableHeader: false,
	cardLayout: false,
	cardLayoutIfSmall: true,
	minibar: {
		selectedColumn: 3,
		barColor: {
			positive: {
				className: "s-viz-color-two-5",
				colorCode: ""
			},
			negative: {
				className: "s-viz-color-six-5",
				colorCode: ""
			}
		}
	}
};
var tool$b = "table";
var subtitle$i = "State by state breakdown";
var minibarsCustomClassName = {
	title: title$v,
	data: data$u,
	sources: sources$u,
	options: options$u,
	tool: tool$b,
	subtitle: subtitle$i
};

var title$u = "FIXTURE: mixed minibars with custom colors (colorCode)";
var data$t = {
	table: [
		[
			"",
			"2016",
			"2017",
			"+/- %"
		],
		[
			"Auftragseingang",
			"10375",
			"10989",
			"6"
		],
		[
			"Umsatz",
			"9683",
			"10178",
			"5"
		],
		[
			"Ebit-Mage (%)",
			"11.7",
			"11.7",
			"-"
		],
		[
			"Cashflow aus Geschäftstätigkeite",
			"929",
			"810",
			"-13"
		]
	],
	metaData: {
		cells: [
		]
	}
};
var sources$t = [
	{
		link: {
		},
		text: "The Centers for Disease Control and Prevention"
	}
];
var options$t = {
	hideTableHeader: false,
	cardLayout: false,
	cardLayoutIfSmall: true,
	minibar: {
		selectedColumn: 3,
		barColor: {
			positive: {
				className: "",
				colorCode: "#c0c0c0"
			},
			negative: {
				className: "",
				colorCode: "#ff7e79"
			}
		}
	}
};
var tool$a = "table";
var subtitle$h = "State by state breakdown";
var minibarsCustomColorCode = {
	title: title$u,
	data: data$t,
	sources: sources$t,
	options: options$t,
	tool: tool$a,
	subtitle: subtitle$h
};

var title$t = "FIXTURE: display footnotes";
var data$s = {
	table: [
		[
			"Rank",
			"Name",
			"Medien",
			"Forschung"
		],
		[
			"1",
			"Hanspeter Musterfrau",
			"250",
			"0"
		],
		[
			"2",
			"Fridolin Hanspeter",
			"240",
			"3"
		],
		[
			"3",
			"Ruedi Müller",
			"200",
			"4"
		],
		[
			"4",
			"Peter Hinterbach",
			"190",
			"0"
		],
		[
			"5",
			"Ralf Vorderbach",
			"150",
			"10"
		]
	],
	metaData: {
		cells: [
			{
				data: {
					footnote: "Frisch verheiratet, früher Hanspeter Mustermann"
				},
				rowIndex: 1,
				colIndex: 1
			},
			{
				data: {
					footnote: "Frisch verheiratet, früher Peter Vorderbach"
				},
				rowIndex: 4,
				colIndex: 1
			},
			{
				data: {
					footnote: "Frisch verheiratet, früher Ralf Hinterbach"
				},
				rowIndex: 5,
				colIndex: 1
			},
			{
				data: {
					footnote: "Verhalten in letzter Spalte"
				},
				rowIndex: 1,
				colIndex: 3
			}
		]
	}
};
var sources$s = [
];
var options$s = {
	hideTableHeader: false,
	cardLayout: false,
	cardLayoutIfSmall: false,
	minibar: {
		invertColors: false,
		barColor: {
			positive: {
				className: "",
				colorCode: ""
			},
			negative: {
				className: "",
				colorCode: ""
			}
		},
		selectedColumn: null
	}
};
var tool$9 = "table";
var subtitle$g = "Einfluss auf Medien und Forschung";
var displayFootnotes = {
	title: title$t,
	data: data$s,
	sources: sources$s,
	options: options$s,
	tool: tool$9,
	subtitle: subtitle$g
};

var title$s = "FIXTURE: display merged footnotes";
var data$r = {
	table: [
		[
			"Rank",
			"Name",
			"Medien",
			"Forschung"
		],
		[
			"1",
			"Hanspeter Musterfrau",
			"250",
			"0"
		],
		[
			"2",
			"Fridolin Hanspeter",
			"240",
			"3"
		],
		[
			"3",
			"Ruedi Müller",
			"200",
			"4"
		],
		[
			"4",
			"Peter Hinterbach",
			"190",
			"0"
		],
		[
			"5",
			"Ralf Vorderbach",
			"150",
			"10"
		]
	],
	metaData: {
		cells: [
			{
				data: {
					footnote: "Frisch verheiratet, früher Hanspeter Mustermann"
				},
				rowIndex: 1,
				colIndex: 1
			},
			{
				data: {
					footnote: "Frisch verheiratet, früher Hanspeter Mustermann"
				},
				rowIndex: 4,
				colIndex: 1
			},
			{
				data: {
					footnote: "Frisch verheiratet, früher Hanspeter Mustermann"
				},
				rowIndex: 5,
				colIndex: 1
			},
			{
				data: {
					footnote: "Frisch verheiratet, früher Hanspeter Mustermann"
				},
				rowIndex: 1,
				colIndex: 3
			}
		]
	}
};
var sources$r = [
];
var options$r = {
	hideTableHeader: false,
	cardLayout: false,
	cardLayoutIfSmall: false,
	minibar: {
		invertColors: false,
		barColor: {
			positive: {
				className: "",
				colorCode: ""
			},
			negative: {
				className: "",
				colorCode: ""
			}
		},
		selectedColumn: null
	}
};
var tool$8 = "table";
var subtitle$f = "Einfluss auf Medien und Forschung";
var displayMergedFootnotes = {
	title: title$s,
	data: data$r,
	sources: sources$r,
	options: options$r,
	tool: tool$8,
	subtitle: subtitle$f
};

var title$r = "FIXTURE: display multiple merged footnotes";
var data$q = {
	table: [
		[
			"Rank",
			"Name",
			"Medien",
			"Forschung"
		],
		[
			"1",
			"Hanspeter Musterfrau",
			"250",
			"0"
		],
		[
			"2",
			"Fridolin Hanspeter",
			"240",
			"3"
		],
		[
			"3",
			"Ruedi Müller",
			"200",
			"4"
		],
		[
			"4",
			"Peter Hinterbach",
			"190",
			"0"
		],
		[
			"5",
			"Ralf Vorderbach",
			"150",
			"10"
		]
	],
	metaData: {
		cells: [
			{
				data: {
					footnote: "Frisch verheiratet, früher Hanspeter Mustermann"
				},
				rowIndex: 1,
				colIndex: 1
			},
			{
				data: {
					footnote: "Frisch verheiratet, früher Hanspeter Mustermann"
				},
				rowIndex: 4,
				colIndex: 1
			},
			{
				data: {
					footnote: "Frisch verheiratet, früher Hanspeter Mustermann"
				},
				rowIndex: 5,
				colIndex: 1
			},
			{
				data: {
					footnote: "Frisch verheiratet, früher Hanspeter Mustermann"
				},
				rowIndex: 1,
				colIndex: 3
			},
			{
				data: {
					footnote: "Frisch verheiratet, früher Hanspeter Musterfrau"
				},
				rowIndex: 2,
				colIndex: 2
			},
			{
				data: {
					footnote: "Frisch verheiratet, früher Hanspeter Musterfrau"
				},
				rowIndex: 2,
				colIndex: 3
			},
			{
				data: {
					footnote: "Frisch verheiratet, früher Hanspeter Musterfrau"
				},
				rowIndex: 3,
				colIndex: 2
			}
		]
	}
};
var sources$q = [
];
var options$q = {
	hideTableHeader: false,
	cardLayout: false,
	cardLayoutIfSmall: false,
	minibar: {
		invertColors: false,
		barColor: {
			positive: {
				className: "",
				colorCode: ""
			},
			negative: {
				className: "",
				colorCode: ""
			}
		},
		selectedColumn: null
	}
};
var tool$7 = "table";
var subtitle$e = "Einfluss auf Medien und Forschung";
var displayMergedFootnotesMultiple = {
	title: title$r,
	data: data$q,
	sources: sources$q,
	options: options$q,
	tool: tool$7,
	subtitle: subtitle$e
};

var title$q = "FIXTURE: display footnotes before minibar";
var data$p = {
	table: [
		[
			"Rank",
			"Name",
			"Medien",
			"Forschung"
		],
		[
			"1",
			"Hanspeter Musterfrau",
			"250",
			"0"
		],
		[
			"2",
			"Fridolin Hanspeter",
			"240",
			"3"
		],
		[
			"3",
			"Ruedi Müller",
			"200",
			"4"
		],
		[
			"4",
			"Peter Hinterbach",
			"190",
			"20"
		],
		[
			"5",
			"Ralf Vorderbach",
			"150",
			"10"
		]
	],
	metaData: {
		cells: [
			{
				data: {
					footnote: "Frisch verheiratet, früher Hanspeter Mustermann"
				},
				rowIndex: 1,
				colIndex: 1
			},
			{
				data: {
					footnote: "Frisch verheiratet, früher Peter Vorderbach"
				},
				rowIndex: 4,
				colIndex: 1
			},
			{
				data: {
					footnote: "Frisch verheiratet, früher Ralf Hinterbach"
				},
				rowIndex: 5,
				colIndex: 1
			},
			{
				data: {
					footnote: "Verhalten in letzter Spalte"
				},
				rowIndex: 1,
				colIndex: 3
			},
			{
				data: {
					footnote: "Beispiel für Minibars"
				},
				rowIndex: 2,
				colIndex: 2
			}
		]
	}
};
var sources$p = [
];
var options$p = {
	hideTableHeader: false,
	cardLayout: false,
	cardLayoutIfSmall: false,
	minibar: {
		invertColors: false,
		barColor: {
			positive: {
				className: "",
				colorCode: ""
			},
			negative: {
				className: "",
				colorCode: ""
			}
		},
		selectedColumn: 3
	}
};
var tool$6 = "table";
var subtitle$d = "Einfluss auf Medien und Forschung";
var displayFootnotesBeforeMinibar = {
	title: title$q,
	data: data$p,
	sources: sources$p,
	options: options$p,
	tool: tool$6,
	subtitle: subtitle$d
};

var title$p = "FIXTURE: display alot of footnotes";
var data$o = {
	table: [
		[
			"Rank",
			"Name",
			"Medien",
			"Forschung"
		],
		[
			"1",
			"Hanspeter Musterfrau",
			"250",
			"0"
		],
		[
			"2",
			"Fridolin Hanspeter",
			"240",
			"3"
		],
		[
			"3",
			"Ruedi Müller",
			"200",
			"4"
		],
		[
			"4",
			"Peter Hinterbach",
			"190",
			"0"
		],
		[
			"5",
			"Ralf Vorderbach",
			"150",
			"10"
		]
	],
	metaData: {
		cells: [
			{
				data: {
					footnote: "test multiple"
				},
				rowIndex: 0,
				colIndex: 0
			},
			{
				data: {
					footnote: "test multiple1"
				},
				rowIndex: 0,
				colIndex: 1
			},
			{
				data: {
					footnote: "test multiple2"
				},
				rowIndex: 0,
				colIndex: 2
			},
			{
				data: {
					footnote: "test multiple3"
				},
				rowIndex: 0,
				colIndex: 3
			},
			{
				data: {
					footnote: "test multiple4"
				},
				rowIndex: 1,
				colIndex: 0
			},
			{
				data: {
					footnote: "test multiple5"
				},
				rowIndex: 1,
				colIndex: 1
			},
			{
				data: {
					footnote: "test multiple6"
				},
				rowIndex: 1,
				colIndex: 2
			},
			{
				data: {
					footnote: "test multiple7"
				},
				rowIndex: 1,
				colIndex: 3
			},
			{
				data: {
					footnote: "test multiple8"
				},
				rowIndex: 2,
				colIndex: 0
			},
			{
				data: {
					footnote: "test multiple9"
				},
				rowIndex: 2,
				colIndex: 1
			}
		]
	}
};
var sources$o = [
];
var options$o = {
	hideTableHeader: false,
	cardLayout: false,
	cardLayoutIfSmall: false,
	minibar: {
		invertColors: false,
		barColor: {
			positive: {
				className: "",
				colorCode: ""
			},
			negative: {
				className: "",
				colorCode: ""
			}
		},
		selectedColumn: 3
	}
};
var tool$5 = "table";
var subtitle$c = "Einfluss auf Medien und Forschung";
var displayAlotOfFootnotes = {
	title: title$p,
	data: data$o,
	sources: sources$o,
	options: options$o,
	tool: tool$5,
	subtitle: subtitle$c
};

var title$o = "FIXTURE: hide footnotes in header";
var data$n = {
	table: [
		[
			"Rank",
			"Name",
			"Medien",
			"Forschung"
		],
		[
			"1",
			"Hanspeter Musterfrau",
			"250",
			"0"
		],
		[
			"2",
			"Fridolin Hanspeter",
			"240",
			"3"
		],
		[
			"3",
			"Ruedi Müller",
			"200",
			"4"
		],
		[
			"4",
			"Peter Hinterbach",
			"190",
			"0"
		],
		[
			"5",
			"Ralf Vorderbach",
			"150",
			"10"
		]
	],
	metaData: {
		cells: [
			{
				data: {
					footnote: "test multiple"
				},
				rowIndex: 0,
				colIndex: 0
			},
			{
				data: {
					footnote: "test multiple1"
				},
				rowIndex: 0,
				colIndex: 1
			},
			{
				data: {
					footnote: "test multiple2"
				},
				rowIndex: 0,
				colIndex: 2
			},
			{
				data: {
					footnote: "test multiple3"
				},
				rowIndex: 0,
				colIndex: 3
			},
			{
				data: {
					footnote: "test multiple4"
				},
				rowIndex: 1,
				colIndex: 0
			},
			{
				data: {
					footnote: "test multiple5"
				},
				rowIndex: 1,
				colIndex: 1
			},
			{
				data: {
					footnote: "test multiple6"
				},
				rowIndex: 1,
				colIndex: 2
			},
			{
				data: {
					footnote: "test multiple7"
				},
				rowIndex: 1,
				colIndex: 3
			},
			{
				data: {
					footnote: "test multiple8"
				},
				rowIndex: 2,
				colIndex: 0
			},
			{
				data: {
					footnote: "test multiple9"
				},
				rowIndex: 2,
				colIndex: 1
			}
		]
	}
};
var sources$n = [
];
var options$n = {
	hideTableHeader: true,
	cardLayout: false,
	cardLayoutIfSmall: false,
	minibar: {
		invertColors: false,
		barColor: {
			positive: {
				className: "",
				colorCode: ""
			},
			negative: {
				className: "",
				colorCode: ""
			}
		},
		selectedColumn: 3
	}
};
var tool$4 = "table";
var subtitle$b = "Einfluss auf Medien und Forschung";
var hideFootnotesInHeader = {
	title: title$o,
	data: data$n,
	sources: sources$n,
	options: options$n,
	tool: tool$4,
	subtitle: subtitle$b
};

var title$n = "FIXTURE: display footnotes in cardlayout";
var data$m = {
	table: [
		[
			"Rank",
			"Name",
			"Medien",
			"Forschung"
		],
		[
			"1",
			"Hanspeter Musterfrau",
			"250",
			"0"
		],
		[
			"2",
			"Fridolin Hanspeter",
			"240",
			"3"
		],
		[
			"3",
			"Ruedi Müller",
			"200",
			"4"
		],
		[
			"4",
			"Peter Hinterbach",
			"190",
			"0"
		],
		[
			"5",
			"Ralf Vorderbach",
			"150",
			"10"
		]
	],
	metaData: {
		cells: [
			{
				data: {
					footnote: "Frisch verheiratet, früher Hanspeter Mustermann"
				},
				rowIndex: 1,
				colIndex: 1
			},
			{
				data: {
					footnote: "Frisch verheiratet, früher Peter Vorderbach"
				},
				rowIndex: 4,
				colIndex: 1
			},
			{
				data: {
					footnote: "Frisch verheiratet, früher Ralf Hinterbach"
				},
				rowIndex: 5,
				colIndex: 1
			},
			{
				data: {
					footnote: "Verhalten in letzter Spalte"
				},
				rowIndex: 1,
				colIndex: 3
			},
			{
				data: {
					footnote: "Header1"
				},
				rowIndex: 0,
				colIndex: 0
			},
			{
				data: {
					footnote: "Header2"
				},
				rowIndex: 0,
				colIndex: 1
			}
		]
	}
};
var sources$m = [
];
var options$m = {
	hideTableHeader: false,
	cardLayout: true,
	cardLayoutIfSmall: false,
	minibar: {
		invertColors: false,
		barColor: {
			positive: {
				className: "",
				colorCode: ""
			},
			negative: {
				className: "",
				colorCode: ""
			}
		},
		selectedColumn: null
	}
};
var tool$3 = "table";
var subtitle$a = "Einfluss auf Medien und Forschung";
var displayFootnotesInCardlayout = {
	title: title$n,
	data: data$m,
	sources: sources$m,
	options: options$m,
	tool: tool$3,
	subtitle: subtitle$a
};

var title$m = "FIXTURE: footnotes with positive minibars";
var data$l = {
	table: [
		[
			"Test1",
			"Test2",
			"Test3",
			"Test4"
		],
		[
			"Test",
			"Test",
			"1",
			"1"
		],
		[
			"Test",
			"Test",
			"2",
			"2"
		],
		[
			"Test",
			"Test",
			"3",
			"3"
		],
		[
			"Test",
			"Test",
			"4",
			"4"
		],
		[
			"Test",
			"Test",
			"5",
			"5"
		],
		[
			"Test",
			"Test",
			"6",
			"6"
		],
		[
			"Test",
			"Test",
			"7",
			"7"
		]
	],
	metaData: {
		cells: [
			{
				data: {
					footnote: "Footnote in header"
				},
				rowIndex: 0,
				colIndex: 0
			},
			{
				data: {
					footnote: "footnote"
				},
				rowIndex: 1,
				colIndex: 1
			},
			{
				data: {
					footnote: "footnote before minibar"
				},
				rowIndex: 2,
				colIndex: 2
			},
			{
				data: {
					footnote: "footnote in minibar"
				},
				rowIndex: 2,
				colIndex: 3
			},
			{
				data: {
					footnote: "footnote in minibar 2"
				},
				rowIndex: 6,
				colIndex: 3
			}
		]
	}
};
var sources$l = [
];
var options$l = {
	hideTableHeader: false,
	cardLayout: false,
	cardLayoutIfSmall: false,
	minibar: {
		invertColors: false,
		barColor: {
			positive: {
				className: "",
				colorCode: ""
			},
			negative: {
				className: "",
				colorCode: ""
			}
		},
		selectedColumn: 3
	}
};
var footnotesPositiveMinibars = {
	title: title$m,
	data: data$l,
	sources: sources$l,
	options: options$l
};

var title$l = "FIXTURE: footnotes with negative minibars";
var data$k = {
	table: [
		[
			"Test1",
			"Test2",
			"Test3",
			"Test4"
		],
		[
			"Test",
			"Test",
			"1",
			"-1"
		],
		[
			"Test",
			"Test",
			"2",
			"-2"
		],
		[
			"Test",
			"Test",
			"3",
			"-3"
		],
		[
			"Test",
			"Test",
			"4",
			"-4"
		],
		[
			"Test",
			"Test",
			"5",
			"-5"
		],
		[
			"Test",
			"Test",
			"6",
			"-6"
		],
		[
			"Test",
			"Test",
			"7",
			"-7"
		]
	],
	metaData: {
		cells: [
			{
				data: {
					footnote: "Footnote in header"
				},
				rowIndex: 0,
				colIndex: 0
			},
			{
				data: {
					footnote: "footnote"
				},
				rowIndex: 1,
				colIndex: 1
			},
			{
				data: {
					footnote: "footnote before minibar"
				},
				rowIndex: 2,
				colIndex: 2
			},
			{
				data: {
					footnote: "footnote in minibar"
				},
				rowIndex: 2,
				colIndex: 3
			},
			{
				data: {
					footnote: "footnote in minibar 2"
				},
				rowIndex: 6,
				colIndex: 3
			}
		]
	}
};
var sources$k = [
];
var options$k = {
	hideTableHeader: false,
	cardLayout: false,
	cardLayoutIfSmall: false,
	minibar: {
		invertColors: false,
		barColor: {
			positive: {
				className: "",
				colorCode: ""
			},
			negative: {
				className: "",
				colorCode: ""
			}
		},
		selectedColumn: 3
	}
};
var footnotesNegativeMinibars = {
	title: title$l,
	data: data$k,
	sources: sources$k,
	options: options$k
};

var title$k = "FIXTURE: footnotes with mixed minibars";
var data$j = {
	table: [
		[
			"Test1",
			"Test2",
			"Test3",
			"Test4"
		],
		[
			"Test",
			"Test",
			"1",
			"-1"
		],
		[
			"Test",
			"Test",
			"2",
			"2"
		],
		[
			"Test",
			"Test",
			"3",
			"-3"
		],
		[
			"Test",
			"Test",
			"4",
			"4"
		],
		[
			"Test",
			"Test",
			"5",
			"-5"
		],
		[
			"Test",
			"Test",
			"6",
			"6"
		],
		[
			"Test",
			"Test",
			"7",
			"-7"
		]
	],
	metaData: {
		cells: [
			{
				data: {
					footnote: "Footnote in header"
				},
				rowIndex: 0,
				colIndex: 0
			},
			{
				data: {
					footnote: "footnote"
				},
				rowIndex: 1,
				colIndex: 1
			},
			{
				data: {
					footnote: "footnote before minibar"
				},
				rowIndex: 2,
				colIndex: 2
			},
			{
				data: {
					footnote: "footnote in minibar"
				},
				rowIndex: 2,
				colIndex: 3
			},
			{
				data: {
					footnote: "footnote in minibar 1"
				},
				rowIndex: 3,
				colIndex: 3
			},
			{
				data: {
					footnote: "footnote in minibar 2"
				},
				rowIndex: 6,
				colIndex: 3
			}
		]
	}
};
var sources$j = [
];
var options$j = {
	hideTableHeader: false,
	cardLayout: false,
	cardLayoutIfSmall: false,
	minibar: {
		invertColors: false,
		barColor: {
			positive: {
				className: "",
				colorCode: ""
			},
			negative: {
				className: "",
				colorCode: ""
			}
		},
		selectedColumn: 3
	}
};
var footnotesMixedMinibars = {
	title: title$k,
	data: data$j,
	sources: sources$j,
	options: options$j
};

var title$j = "FIXTURE: cardlayout";
var subtitle$9 = "Subtitle";
var data$i = {
	table: [
		[
			"Kennzahlen",
			"2016",
			"2017",
			"+/-"
		],
		[
			"Umsatz",
			"66.2",
			"70.4",
			"6"
		],
		[
			"Betriebsergebnis Ebit",
			"7.9",
			"",
			"-19"
		],
		[
			"Ebit-Marge (%)",
			"11.9",
			"9.1",
			null
		],
		[
			"Konzernergebnis",
			"6.30",
			"4.10",
			"-35"
		],
		[
			"Cashflow aus Geschäftstätigkeit",
			"8",
			"5.80",
			"-28"
		],
		[
			"Eigenkapitalquote (%)",
			"72.3",
			"71.8",
			null
		],
		[
			"Nettoliquidität",
			"42.30",
			"41.80",
			"-1"
		]
	],
	metaData: {
		cells: [
		]
	}
};
var sources$i = [
];
var options$i = {
	cardLayout: true,
	cardLayoutIfSmall: false
};
var cardlayout = {
	title: title$j,
	subtitle: subtitle$9,
	data: data$i,
	sources: sources$i,
	options: options$i
};

var title$i = "FIXTURE: cardlayout on mobile";
var subtitle$8 = "Subtitle";
var data$h = {
	table: [
		[
			"Kennzahlen",
			"2016",
			"2017",
			"+/-"
		],
		[
			"Umsatz",
			"66.2",
			"70.4",
			"6"
		],
		[
			"Betriebsergebnis Ebit",
			"7.9",
			"",
			"-19"
		],
		[
			"Ebit-Marge (%)",
			"11.9",
			"9.1",
			null
		],
		[
			"Konzernergebnis",
			"6.30",
			"4.10",
			"-35"
		],
		[
			"Cashflow aus Geschäftstätigkeit",
			"8",
			"5.80",
			"-28"
		],
		[
			"Eigenkapitalquote (%)",
			"72.3",
			"71.8",
			null
		],
		[
			"Nettoliquidität",
			"42.30",
			"41.80",
			"-1"
		]
	],
	metaData: {
		cells: [
		]
	}
};
var sources$h = [
];
var options$h = {
	cardLayout: false,
	cardLayoutIfSmall: true
};
var cardlayoutMobile = {
	title: title$i,
	subtitle: subtitle$8,
	data: data$h,
	sources: sources$h,
	options: options$h
};

var title$h = "FIXTURE: lots of data";
var data$g = {
	table: [
		[
			"Kategorie",
			"Rang",
			"Name",
			"Jahrgang",
			"Gemeinde",
			"Zeit"
		],
		[
			"42-Men",
			"242",
			"Abderhalden Reto",
			"1988",
			"Bächli (Hemberg)",
			"1:36.44,1"
		],
		[
			"42-Wom",
			"740",
			"Abgottspon Laura",
			"1990",
			"St.Gallen",
			"2:41.00,2"
		],
		[
			"42-Men",
			"1106",
			"Ackermann Albert",
			"1949",
			"Mels",
			"1:50.18,6"
		],
		[
			"42-Men",
			"1283",
			"Ackermann Alex",
			"1984",
			"Heiligkreuz (Mels)",
			"1:52.18,2"
		],
		[
			"42-Men",
			"4741",
			"Ackermann Jonas",
			"1998",
			"Mels",
			"2:42.02,5"
		],
		[
			"42-Men",
			"4624",
			"Aeby Lorenz",
			"1977",
			"St.Gallen",
			"2:40.02,0"
		],
		[
			"42-Men",
			"3564",
			"Albertin Ismael",
			"1981",
			"St.Gallen",
			"2:24.29,8"
		],
		[
			"42-Men",
			"6749",
			"Albrecht Christian",
			"1984",
			"Walenstadt",
			"3:18.54,6"
		],
		[
			"21-Men",
			"1014",
			"Alessi Filippo",
			"1967",
			"Rorschach",
			"2:50.48,1"
		],
		[
			"42-Wom",
			"350",
			"Alexander Nathalie",
			"1989",
			"St.Gallen",
			"2:16.20,8"
		],
		[
			"42-Men",
			"4948",
			"Allenspach Florian",
			"1994",
			"Gossau",
			"2:45.16,4"
		],
		[
			"42-Wom",
			"861",
			"Allmann Andrea",
			"1972",
			"Wildhaus",
			"2:47.49,3"
		],
		[
			"42-Wom",
			"531",
			"Altherr Sybille",
			"1983",
			"St.Peterzell",
			"2:29.12,1"
		],
		[
			"42-Wom",
			"1946",
			"Ammann Bernadette",
			"1989",
			"St.Gallen",
			"3:40.46,3"
		],
		[
			"42-Wom",
			"1322",
			"Ammann Kathrin",
			"1987",
			"Grabs",
			"3:09.49,0"
		],
		[
			"42-Men",
			"3685",
			"Ammann Marius",
			"1985",
			"Jona",
			"2:26.18,3"
		],
		[
			"42-Men",
			"1457",
			"Ammann Rene",
			"1971",
			"Unterwasser",
			"1:54.04,7"
		],
		[
			"42-Men",
			"4150",
			"Ammann Tobias",
			"1982",
			"St.Gallen",
			"2:33.18,3"
		],
		[
			"21-Men",
			"538",
			"Ammann Yanic",
			"1993",
			"St.Gallen",
			"1:41.39,0"
		],
		[
			"42-Men",
			"6909",
			"Amstutz Meinrad",
			"1968",
			"St.Gallen",
			"3:23.24,3"
		],
		[
			"42-Wom",
			"2057",
			"Anderegg Dorothee",
			"1980",
			"St.Gallen",
			"3:49.48,0"
		],
		[
			"21-Men",
			"57",
			"Anderegg Peter",
			"1962",
			"Ulisbach",
			"59.30.6"
		],
		[
			"42-Men",
			"180",
			"Appius Christoph",
			"1962",
			"Wattwil",
			"1:34.11,8"
		],
		[
			"42-Wom",
			"425",
			"Appius Corina",
			"1986",
			"St.Gallen",
			"2:22.04,1"
		],
		[
			"42-Wom",
			"781",
			"Appius Julia",
			"1992",
			"Wattwil",
			"2:43.00,2"
		],
		[
			"42-Wom",
			"636",
			"Appius Sara",
			"1993",
			"Wattwil",
			"2:35.11,2"
		],
		[
			"42-Men",
			"2071",
			"Appius Simon",
			"1987",
			"Wattwil",
			"2:02.38,6"
		],
		[
			"42-Men",
			"7457",
			"Aranda Franz",
			"1962",
			"Walenstadt",
			"3:40.33,2"
		],
		[
			"42-Men",
			"1109",
			"Aregger Philipp",
			"1971",
			"Buchs",
			"1:50.20,5"
		],
		[
			"42-Men",
			"3520",
			"Arn René",
			"1954",
			"Heerbrugg",
			"2:23.56,9"
		],
		[
			"42-Wom",
			"146",
			"Babst Riccarda",
			"1992",
			"Bad Ragaz",
			"1:55.42,7"
		],
		[
			"21-Men",
			"778",
			"Bachmann Daniel",
			"1987",
			"Schwarzenbach",
			"2:00.19,1"
		],
		[
			"42-Men",
			"6678",
			"Backes Hansueli",
			"1952",
			"St.Gallen",
			"3:17.04,9"
		],
		[
			"42-Men",
			"4046",
			"Bailer Urs",
			"1963",
			"Rapperswil",
			"2:31.48,3"
		],
		[
			"21-Wom",
			"482",
			"Baumann Anina",
			"1999",
			"Rapperswil",
			"1:49.03,2"
		],
		[
			"42-Men",
			"7706",
			"Baumgartner Armin",
			"1961",
			"Widnau",
			"3:51.05,8"
		],
		[
			"42-Wom",
			"2077",
			"Baumgartner Cornelia",
			"1963",
			"Widnau",
			"3:51.03,4"
		],
		[
			"42-Men",
			"1564",
			"Baumgartner Peter",
			"1965",
			"Mosnang",
			"1:55.11,2"
		],
		[
			"42-Men",
			"6192",
			"Baumgartner Philippe",
			"1990",
			"Widnau",
			"3:06.59,8"
		],
		[
			"42-Men",
			"4629",
			"Bawidamann Lukas",
			"1983",
			"Wattwil",
			"2:40.10,2"
		],
		[
			"42-Men",
			"5271",
			"Bellini Claudio",
			"1968",
			"Goldach",
			"2:51.16,4"
		],
		[
			"42-Men",
			"2735",
			"Bellini Vittorio",
			"1965",
			"Tübach",
			"2:12.06,1"
		],
		[
			"42-Men",
			"6566",
			"Benz Manuel",
			"1992",
			"Heerbrugg",
			"3:14.24,0"
		],
		[
			"42-Men",
			"7039",
			"Benzoni Mattia",
			"1968",
			"Kaltbrunn",
			"3:26.53,9"
		],
		[
			"42-Men",
			"3645",
			"Berchtold Markus",
			"1955",
			"Sargans",
			"2:25.36,2"
		],
		[
			"21-Men",
			"475",
			"Bernhardsgrütter Simon",
			"1972",
			"Rapperswil",
			"1:37.18,9"
		],
		[
			"42-Wom",
			"1043",
			"Bernhardsgrütter Stefa",
			"1986",
			"Rapperswil",
			"2:57.15,0"
		],
		[
			"42-Men",
			"4839",
			"Bertsch Lionel",
			"1995",
			"Abtwil",
			"2:43.35,3"
		],
		[
			"42-Wom",
			"1689",
			"Beschi Johanna",
			"1998",
			"Waldkirch",
			"3:26.07,5"
		],
		[
			"42-Wom",
			"1289",
			"Bickert Cornelia",
			"1966",
			"Widnau",
			"3:08.17,6"
		],
		[
			"42-Men",
			"967",
			"Biel Philippe",
			"1991",
			"Bad Ragaz",
			"1:48.43,9"
		],
		[
			"42-Men",
			"3865",
			"Bindschedler Felix",
			"1981",
			"Jona",
			"2:29.03,5"
		],
		[
			"42-Wom",
			"2100",
			"Bingesser Eliane",
			"1999",
			"Muolen",
			"3:52.26,5"
		],
		[
			"42-Men",
			"2107",
			"Binz Thomas",
			"1975",
			"Diepoldsau",
			"2:03.09,0"
		],
		[
			"42-Men",
			"1364",
			"Bischof Daniel",
			"1967",
			"Mörschwil",
			"1:53.07,0"
		],
		[
			"42-Men",
			"4687",
			"Bislin David",
			"1990",
			"Mels",
			"2:41.10,4"
		],
		[
			"42-Wom",
			"1118",
			"Bislin Olivia",
			"1991",
			"Sargans",
			"3:00.45,1"
		],
		[
			"42-Wom",
			"2190",
			"Bislin Trudi",
			"1966",
			"Mels",
			"4:00.39,3"
		],
		[
			"42-Men",
			"5262",
			"Bislin Werner",
			"1959",
			"Mels",
			"2:51.09,4"
		],
		[
			"42-Men",
			"2102",
			"Bitschnau Andreas",
			"1987",
			"Kirchberg",
			"2:03.04,7"
		],
		[
			"42-Wom",
			"1834",
			"Bizozzero Sabina",
			"1984",
			"Mels",
			"3:33.47,6"
		],
		[
			"42-Men",
			"1650",
			"Bleiker Roman",
			"1988",
			"Ricken",
			"1:56.22,1"
		],
		[
			"21-Wom",
			"597",
			"Bleisch Patricia",
			"2000",
			"Flumserberg",
			"1:57.31,1"
		],
		[
			"42-Wom",
			"410",
			"Bless Elvira",
			"1979",
			"Bad Ragaz",
			"2:21.23,0"
		],
		[
			"42-Men",
			"3497",
			"Bless Tobias",
			"1990",
			"Walenstadt",
			"2:23.36,1"
		],
		[
			"42-Wom",
			"1705",
			"Blumenthal  Marli",
			"1959",
			"Mels",
			"3:26.48,9"
		],
		[
			"42-Men",
			"6595",
			"Böhi Christian",
			"1983",
			"Gossau",
			"3:15.01,8"
		],
		[
			"42-Men",
			"2411",
			"Bollinger Walter",
			"1959",
			"Niederuzwil",
			"2:07.27,3"
		],
		[
			"42-Men",
			"7747",
			"Bommeli James",
			"1995",
			"Gossau",
			"3:53.12,6"
		],
		[
			"42-Wom",
			"2284",
			"Bös Beatrice",
			"1974",
			"Hurden",
			"4:12.31,0"
		],
		[
			"42-Men",
			"4127",
			"Bosetti Roman",
			"1966",
			"Uznach",
			"2:33.02,9"
		],
		[
			"42-Men",
			"353",
			"Bosshart Adrian",
			"1994",
			"Altenrhein",
			"1:39.47,0"
		],
		[
			"42-Men",
			"1975",
			"Bosshart Alex",
			"1962",
			"Altenrhein",
			"2:01.04,4"
		],
		[
			"21-Wom",
			"459",
			"Bosshart Alina",
			"1996",
			"Altenrhein",
			"1:47.48,5"
		],
		[
			"42-Men",
			"4430",
			"Bosshart Beat",
			"1964",
			"Altenrhein",
			"2:36.58,2"
		],
		[
			"42-Wom",
			"884",
			"Bosshart Elin",
			"1999",
			"Altenrhein",
			"2:49.17,6"
		],
		[
			"42-Men",
			"1724",
			"Bosshart Reto",
			"1967",
			"Thal",
			"1:57.22,8"
		],
		[
			"42-Men",
			"1872",
			"Bötschi Philip",
			"1983",
			"St.Gallen",
			"1:59.33,8"
		],
		[
			"42-Men",
			"577",
			"Brägger Urs",
			"1965",
			"Wattwil",
			"1:43.19,9"
		],
		[
			"42-Men",
			"8041",
			"Brand Adrian",
			"1987",
			"St.Gallen",
			"4:11.50,1"
		],
		[
			"42-Men",
			"7523",
			"Brändle Franz",
			"1961",
			"Wittenbach",
			"3:43.06,2"
		],
		[
			"42-Wom",
			"479",
			"Brändle Mägi",
			"1966",
			"Mosnang",
			"2:25.35,1"
		],
		[
			"42-Men",
			"1443",
			"Brändle Michael",
			"1964",
			"St.Gallen",
			"1:53.56,5"
		],
		[
			"42-Men",
			"4369",
			"Braun Maximilian",
			"1992",
			"Au",
			"2:36.06,4"
		],
		[
			"21-Wom",
			"258",
			"Bregenzer Christina",
			"2000",
			"Rorschacherberg",
			"1:35.17,7"
		],
		[
			"42-Men",
			"2713",
			"Brehm Thomas",
			"1972",
			"St.Gallen",
			"2:11.45,2"
		],
		[
			"42-Men",
			"1959",
			"Breitenmoser Thomas",
			"1976",
			"Bütschwil",
			"2:00.55,1"
		],
		[
			"42-Men",
			"6084",
			"Breu Hans",
			"1959",
			"Diepoldsau",
			"3:04.38,5"
		],
		[
			"42-Wom",
			"839",
			"Breu Stefanie",
			"1992",
			"Diepoldsau",
			"2:46.31,8"
		],
		[
			"42-Men",
			"2565",
			"Bruhin Marco",
			"1981",
			"Zuckenriet",
			"2:09.49,0"
		],
		[
			"42-Men",
			"3309",
			"Brühwiler Guido",
			"1961",
			"Jona",
			"2:20.43,3"
		],
		[
			"42-Men",
			"773",
			"Brun Silvan",
			"1963",
			"Bichwil",
			"1:46.07,1"
		],
		[
			"42-Men",
			"984",
			"Brun Silvan",
			"1989",
			"Rapperswil",
			"1:48.57,2"
		],
		[
			"42-Men",
			"6011",
			"Brun Simon",
			"1999",
			"Bichwil",
			"3:03.33,8"
		],
		[
			"42-Men",
			"5660",
			"Brunner August",
			"1956",
			"Jona",
			"2:57.37,7"
		],
		[
			"42-Wom",
			"1064",
			"Brunner Erika",
			"1962",
			"Dietfurt",
			"2:58.22,3"
		],
		[
			"42-Men",
			"6045",
			"Brunner Jürg",
			"1955",
			"Wattwil",
			"3:03.56,7"
		],
		[
			"42-Men",
			"2505",
			"Bücheler Christoph",
			"1969",
			"Goldach",
			"2:08.56,8"
		],
		[
			"42-Men",
			"3437",
			"Büchi Felix",
			"1988",
			"Ennetbühl",
			"2:22.39,9"
		],
		[
			"21-Wom",
			"871",
			"Büchi Jeanin",
			"1986",
			"Rorschacherberg",
			"2:48.12,6"
		],
		[
			"42-Men",
			"3884",
			"Büchi Tim",
			"1990",
			"St.Gallen",
			"2:29.20,1"
		],
		[
			"42-Men",
			"268",
			"Buchli Markus",
			"1974",
			"Rapperswil",
			"1:37.35,4"
		],
		[
			"42-Men",
			"2269",
			"Bühler Daniel",
			"1970",
			"Bad Ragaz",
			"2:05.28,5"
		],
		[
			"21-Men",
			"998",
			"Bulut Enkido",
			"2002",
			"Wil",
			"2:46.02,3"
		],
		[
			"21-Men",
			"994",
			"Bulut Gelgamesch",
			"2002",
			"Wil",
			"2:45.34,6"
		],
		[
			"42-Men",
			"275",
			"Bürge Karl",
			"1969",
			"Mosnang",
			"1:37.56,9"
		],
		[
			"21-Men",
			"334",
			"Bürge Lukas",
			"2001",
			"Flawil",
			"1:28.11,2"
		],
		[
			"42-Men",
			"1426",
			"Bürgler Thomas",
			"1979",
			"Nesslau",
			"1:53.40,7"
		],
		[
			"21-Wom",
			"240",
			"Buschor Corinne",
			"1982",
			"Uznach",
			"1:34.09,9"
		],
		[
			"42-Men",
			"1073",
			"Buschor Daniel",
			"1980",
			"Uznach",
			"1:49.56,0"
		],
		[
			"42-Men",
			"6555",
			"Büsser Cédric",
			"1989",
			"Wil",
			"3:14.12,6"
		],
		[
			"42-Wom",
			"1899",
			"Büsser Julia",
			"1987",
			"Rapperswil",
			"3:37.59,6"
		],
		[
			"42-Men",
			"8267",
			"Cadusch Thomas",
			"1986",
			"Lenggenwil",
			"4:51.59,6"
		],
		[
			"42-Men",
			"5311",
			"Cam Ferdi",
			"1987",
			"Gams",
			"2:51.58,5"
		],
		[
			"42-Wom",
			"340",
			"Camastral Melitta",
			"1964",
			"Au",
			"2:15.03,9"
		],
		[
			"42-Men",
			"6955",
			"Casanova Marco",
			"1980",
			"Wangs",
			"3:24.33,9"
		],
		[
			"42-Men",
			"774",
			"Cathomen Dario",
			"1988",
			"Bad Ragaz",
			"1:46.07,2"
		],
		[
			"42-Men",
			"4719",
			"Cecchinato Danielo",
			"1961",
			"Flawil",
			"2:41.40,2"
		],
		[
			"42-Men",
			"7821",
			"Colonna Gianni",
			"1999",
			"Untereggen",
			"3:56.29,1"
		],
		[
			"42-Men",
			"5854",
			"Colruyt Jan",
			"1968",
			"Lichtensteig",
			"3:00.48,8"
		],
		[
			"42-Men",
			"7940",
			"Colruyt Joas",
			"2002",
			"Lichtensteig",
			"4:03.57,4"
		],
		[
			"21-Men",
			"720",
			"Crisafulli Antonino",
			"1964",
			"Walenstadt",
			"1:54.52,6"
		],
		[
			"42-Men",
			"5897",
			"Crottogini Rico",
			"1987",
			"St.Gallen",
			"3:01.31,4"
		],
		[
			"42-Men",
			"19",
			"Danuser Dajan",
			"1996",
			"Bad Ragaz",
			"1:23.44,6"
		],
		[
			"42-Men",
			"271",
			"Danuser Hansjörg",
			"1962",
			"Bad Ragaz",
			"1:37.38,5"
		],
		[
			"42-Wom",
			"170",
			"Danuser Iris",
			"1970",
			"Bad Ragaz",
			"1:59.29,8"
		],
		[
			"42-Men",
			"59",
			"Danuser Marius",
			"1992",
			"Bad Ragaz",
			"1:24.51,0"
		],
		[
			"21-Men",
			"773",
			"De La Poza Juan",
			"1963",
			"Goldach",
			"1:59.38,7"
		],
		[
			"42-Men",
			"4951",
			"De Luca Arnaud",
			"1970",
			"Sargans",
			"2:45.17,9"
		],
		[
			"42-Wom",
			"1230",
			"Defila Anja",
			"1993",
			"Wildhaus",
			"3:05.27,6"
		],
		[
			"42-Men",
			"3853",
			"Denoth Hanspeter",
			"1953",
			"Engelburg",
			"2:28.46,3"
		],
		[
			"21-Wom",
			"95",
			"Denzler Sibylle",
			"1987",
			"St.Gallen",
			"1:21.41,1"
		],
		[
			"21-Men",
			"552",
			"Deuber Lucas",
			"1990",
			"Eschenbach",
			"1:42.24,3"
		],
		[
			"21-Wom",
			"181",
			"Diesner Neva",
			"1984",
			"Mels",
			"1:30.24,4"
		],
		[
			"42-Men",
			"5661",
			"Diethelm Markus",
			"1987",
			"Rorschach",
			"2:57.38,7"
		],
		[
			"42-Men",
			"1841",
			"Diethelm Thomas",
			"1978",
			"Kaltbrunn",
			"1:59.07,9"
		],
		[
			"42-Wom",
			"1055",
			"Dietrich Cäcilia",
			"1971",
			"Vilters",
			"2:57.55,3"
		],
		[
			"42-Men",
			"5280",
			"Dietrich Elias",
			"2000",
			"Vilters",
			"2:51.26,0"
		],
		[
			"42-Men",
			"2749",
			"Dietsche Ivo",
			"1973",
			"Andwil",
			"2:12.15,4"
		],
		[
			"42-Men",
			"683",
			"Dietsche Matthias",
			"1954",
			"Kriessern",
			"1:44.47,7"
		],
		[
			"42-Men",
			"2765",
			"Dietsche Thomas",
			"1972",
			"Altstätten",
			"2:12.31,4"
		],
		[
			"42-Men",
			"4354",
			"Dobler Andreas",
			"2000",
			"Oberuzwil",
			"2:35.55,1"
		],
		[
			"21-Wom",
			"155",
			"Dobler Daniela",
			"1993",
			"Oberuzwil",
			"1:27.41,5"
		],
		[
			"42-Men",
			"2183",
			"Dobler Ernst",
			"1991",
			"Oberuzwil",
			"2:04.07,7"
		],
		[
			"21-Men",
			"308",
			"Dobler Roman",
			"1982",
			"St.Gallen",
			"1:26.28,6"
		],
		[
			"42-Men",
			"7908",
			"Dolder Guido",
			"1953",
			"Rorschacherberg",
			"4:01.42,4"
		],
		[
			"42-Men",
			"7467",
			"Dolder Magnus",
			"1982",
			"Steinach",
			"3:41.02,2"
		],
		[
			"42-Men",
			"456",
			"Domeisen Stefan",
			"1992",
			"Rapperswil",
			"1:41.54,5"
		],
		[
			"42-Wom",
			"1204",
			"Dontova Tereza",
			"1990",
			"Oberschan",
			"3:04.08,3"
		],
		[
			"42-Men",
			"5789",
			"Dörig Markus",
			"1955",
			"Uetliburg",
			"2:59.49,0"
		],
		[
			"42-Men",
			"1713",
			"Dosch Severin",
			"1984",
			"St.Gallen",
			"1:57.15,5"
		],
		[
			"42-Men",
			"7904",
			"Dubacher Severin",
			"1990",
			"St.Gallen",
			"4:01.16,4"
		],
		[
			"21-Men",
			"556",
			"Dudli Diego",
			"1988",
			"Wil",
			"1:42.46,0"
		],
		[
			"42-Men",
			"2429",
			"Duft Silvan",
			"1983",
			"Zuckenriet",
			"2:07.44,3"
		],
		[
			"21-Men",
			"428",
			"Düring Albert",
			"1957",
			"Schänis",
			"1:35.07,9"
		],
		[
			"21-Wom",
			"79",
			"Düring Helen",
			"1970",
			"Schänis",
			"1:20.34,5"
		],
		[
			"42-Men",
			"2177",
			"Düring Roman",
			"1995",
			"Schänis",
			"2:04.04,0"
		],
		[
			"42-Men",
			"6111",
			"Dürr Samuel",
			"1988",
			"Walenstadt",
			"3:05.25,3"
		],
		[
			"21-Men",
			"19",
			"Durrer Andreas",
			"2003",
			"Vilters",
			"50.26.0"
		],
		[
			"21-Wom",
			"514",
			"Durrer Béatrice",
			"1971",
			"Vilters",
			"1:51.19,3"
		],
		[
			"21-Men",
			"43",
			"Durrer Flavio",
			"2004",
			"Vilters",
			"56.29.7"
		],
		[
			"42-Men",
			"740",
			"Durrer Peter",
			"1965",
			"Vilters",
			"1:45.39,1"
		],
		[
			"42-Men",
			"2509",
			"Eberhard Florian",
			"1986",
			"Weesen",
			"2:09.03,1"
		],
		[
			"42-Wom",
			"151",
			"Eberle Eicher Andrea",
			"1974",
			"Ricken",
			"1:56.29,0"
		],
		[
			"21-Men",
			"996",
			"Edelmann Sascha",
			"1970",
			"Flawil",
			"2:45.58,7"
		],
		[
			"21-Men",
			"577",
			"Edvinsson Tomas",
			"1978",
			"Kirchberg",
			"1:44.19,2"
		],
		[
			"42-Wom",
			"2055",
			"Eggenberger Regula",
			"1989",
			"Grabs",
			"3:49.46,3"
		],
		[
			"42-Men",
			"1755",
			"Eggenberger Thomas",
			"1964",
			"St.Gallen",
			"1:57.48,1"
		],
		[
			"21-Wom",
			"450",
			"Egger Caroline",
			"1990",
			"St.Gallen",
			"1:47.17,3"
		],
		[
			"42-Men",
			"5025",
			"Egli Prisco",
			"1992",
			"Jonschwil",
			"2:46.43,2"
		],
		[
			"42-Men",
			"6963",
			"Eichbaum Gernot",
			"1972",
			"Altstätten",
			"3:24.48,6"
		],
		[
			"42-Men",
			"3832",
			"Eichenberger Ralf",
			"1984",
			"Benken",
			"2:28.22,1"
		],
		[
			"42-Men",
			"127",
			"Eigenmann Christoph",
			"1979",
			"Wattwil",
			"1:30.03,1"
		],
		[
			"42-Men",
			"450",
			"Eigenmann Patrick",
			"1977",
			"Wattwil",
			"1:41.45,3"
		],
		[
			"42-Men",
			"1728",
			"Eilinger Mathias",
			"1973",
			"Züberwangen",
			"1:57.24,5"
		],
		[
			"42-Men",
			"3574",
			"Eisenhut Emil",
			"1964",
			"Wittenbach",
			"2:24.35,5"
		],
		[
			"42-Men",
			"4344",
			"Elser Peter",
			"1978",
			"St.Gallen",
			"2:35.45,9"
		],
		[
			"42-Men",
			"8027",
			"Engel Philipp",
			"1974",
			"Goldach",
			"4:10.57,9"
		],
		[
			"42-Men",
			"4036",
			"Engler Heinrich",
			"1956",
			"Gossau",
			"2:31.45,1"
		],
		[
			"21-Wom",
			"284",
			"Enzler Kehl Sybille",
			"1981",
			"Berneck",
			"1:37.11,6"
		],
		[
			"42-Men",
			"7149",
			"Epper Reto",
			"1974",
			"Steinach",
			"3:29.29,1"
		],
		[
			"42-Men",
			"2793",
			"Eugster Marcel",
			"1978",
			"St.Gallen",
			"2:12.54,6"
		],
		[
			"21-Men",
			"198",
			"Fäh Marco",
			"1973",
			"Kaltbrunn",
			"1:17.13,4"
		],
		[
			"42-Men",
			"4449",
			"Faeh Markus",
			"1981",
			"Rorschach",
			"2:37.20,7"
		],
		[
			"42-Men",
			"4688",
			"Fäh Nikolaus",
			"1955",
			"Schänis",
			"2:41.10,7"
		],
		[
			"42-Men",
			"3477",
			"Fäh Wendel",
			"1953",
			"Maseltrangen",
			"2:23.11,9"
		],
		[
			"42-Men",
			"6198",
			"Falk Pascal",
			"1995",
			"Ebnat-Kappel",
			"3:07.05,9"
		],
		[
			"42-Men",
			"2656",
			"Färber Philipp",
			"1983",
			"Berneck",
			"2:11.00,3"
		],
		[
			"42-Men",
			"751",
			"Fässler Elia",
			"2000",
			"Ebnat-Kappel",
			"1:45.52,9"
		],
		[
			"42-Men",
			"364",
			"Fässler Marcel",
			"1968",
			"Zuckenriet",
			"1:39.49,3"
		],
		[
			"42-Men",
			"8023",
			"Fauquex Eugen",
			"1952",
			"Zuzwil",
			"4:10.34,3"
		],
		[
			"21-Wom",
			"866",
			"Fecker Sereina",
			"2002",
			"Henau",
			"2:46.09,4"
		],
		[
			"42-Wom",
			"384",
			"Federer Bernadette",
			"1975",
			"St.Gallen",
			"2:19.03,8"
		],
		[
			"42-Men",
			"3550",
			"Felbecker Ansgar",
			"1975",
			"St.Gallen",
			"2:24.20,6"
		],
		[
			"21-Wom",
			"121",
			"Felbecker Barbara",
			"1980",
			"St.Gallen",
			"1:24.24,0"
		],
		[
			"21-Wom",
			"501",
			"Feldkamp Gerda",
			"1963",
			"Gommiswald",
			"1:50.32,0"
		],
		[
			"42-Men",
			"7410",
			"Fischbacher Marcel",
			"1975",
			"Untereggen",
			"3:38.56,6"
		],
		[
			"42-Men",
			"8378",
			"Fischer Klaus",
			"1964",
			"Gossau",
			"1:52.30,8"
		],
		[
			"42-Men",
			"6691",
			"Fischli Markus",
			"1963",
			"Vilters",
			"3:17.25,7"
		],
		[
			"42-Men",
			"5809",
			"Forster Daniel",
			"1961",
			"St.Gallen",
			"3:00.09,2"
		],
		[
			"42-Men",
			"962",
			"Franck Andi",
			"1963",
			"Jonschwil",
			"1:48.40,7"
		],
		[
			"42-Wom",
			"709",
			"Franck Marigna",
			"1992",
			"St.Gallen",
			"2:39.17,4"
		],
		[
			"42-Wom",
			"1955",
			"Frei-Gmür Eva",
			"1987",
			"Gossau",
			"3:41.19,6"
		],
		[
			"42-Wom",
			"834",
			"Frei Janine",
			"1994",
			"St.Gallen",
			"2:46.11,3"
		],
		[
			"42-Men",
			"901",
			"Frei Jürg",
			"1966",
			"Wattwil",
			"1:47.50,0"
		],
		[
			"42-Men",
			"7475",
			"Frei Stefan",
			"1990",
			"Gossau",
			"3:41.18,5"
		],
		[
			"21-Men",
			"52",
			"Freund Christian",
			"1970",
			"Vilters",
			"58.38.3"
		],
		[
			"21-Men",
			"36",
			"Freund Jonas",
			"2003",
			"Vilters",
			"55.19.2"
		],
		[
			"42-Men",
			"4664",
			"Frey Gabriel Lukas",
			"1986",
			"Au",
			"2:40.46,6"
		],
		[
			"42-Men",
			"5290",
			"Frick Michael",
			"1977",
			"Sargans",
			"2:51.33,6"
		],
		[
			"42-Men",
			"1337",
			"Friedrich Oliver",
			"1986",
			"Buchs",
			"1:52.52,2"
		],
		[
			"42-Men",
			"4100",
			"Frischknecht Fabian",
			"1995",
			"Gossau",
			"2:32.33,5"
		],
		[
			"42-Men",
			"6759",
			"Fritsche Michael",
			"1999",
			"Montlingen",
			"3:19.25,6"
		],
		[
			"21-Men",
			"766",
			"Frommenwiler Oliver",
			"1970",
			"Rorschach",
			"1:59.06,3"
		],
		[
			"42-Wom",
			"441",
			"Frommer Susan",
			"1970",
			"Sargans",
			"2:22.53,0"
		],
		[
			"42-Men",
			"2830",
			"Fuchs Franz",
			"1953",
			"Niederuzwil",
			"2:13.24,7"
		],
		[
			"21-Men",
			"227",
			"Fust Erich",
			"2000",
			"Dreien",
			"1:19.59,0"
		],
		[
			"42-Men",
			"7001",
			"Gabathuler Hans",
			"1949",
			"Oberschan",
			"3:25.50,9"
		],
		[
			"42-Men",
			"3791",
			"Gabathuler Rino",
			"1996",
			"Oberschan",
			"2:27.46,6"
		],
		[
			"42-Men",
			"6551",
			"Gächter Remo",
			"1975",
			"Oberriet",
			"3:14.03,2"
		],
		[
			"42-Wom",
			"1212",
			"Gächter Sonja",
			"1990",
			"Walenstadt",
			"3:04.44,2"
		],
		[
			"42-Wom",
			"2154",
			"Gämperle Barbara",
			"1979",
			"Wattwil",
			"3:56.40,0"
		],
		[
			"21-Wom",
			"78",
			"Gattlen Kathrin",
			"1985",
			"Mels",
			"1:20.33,6"
		],
		[
			"42-Wom",
			"306",
			"Gautschi Eva",
			"1970",
			"Rorschach",
			"2:12.50,2"
		],
		[
			"42-Men",
			"1590",
			"Gebert Christoph",
			"1992",
			"Wil",
			"1:55.31,5"
		],
		[
			"42-Men",
			"6846",
			"Gees Silvio",
			"1986",
			"Bad Ragaz",
			"3:21.50,0"
		],
		[
			"42-Men",
			"2661",
			"Gehrig Marco",
			"1959",
			"Gähwil",
			"2:11.03,3"
		],
		[
			"21-Men",
			"94",
			"Gehrig Robert",
			"1975",
			"Kirchberg",
			"1:08.26,8"
		],
		[
			"42-Men",
			"317",
			"Gehrig Sandro",
			"1992",
			"Zuzwil",
			"1:39.10,9"
		],
		[
			"42-Men",
			"6407",
			"Gelmi Michael",
			"1985",
			"Flums",
			"3:10.44,7"
		],
		[
			"21-Wom",
			"238",
			"Gerber Lena",
			"1988",
			"St.Gallen",
			"1:34.04,9"
		],
		[
			"42-Men",
			"7054",
			"Gerber Remo",
			"1979",
			"Wittenbach",
			"3:27.10,9"
		],
		[
			"42-Wom",
			"1014",
			"Gerig Marina",
			"1987",
			"Dietfurt",
			"2:56.02,4"
		],
		[
			"42-Wom",
			"2102",
			"Germann Andrina",
			"1999",
			"Muolen",
			"3:52.27,6"
		],
		[
			"42-Men",
			"7587",
			"Germann Ruedi",
			"1954",
			"Wolfertswil",
			"3:45.26,1"
		],
		[
			"42-Wom",
			"2274",
			"Germann Sonja",
			"1973",
			"Muolen",
			"4:10.18,6"
		],
		[
			"42-Men",
			"1466",
			"Gienuth Fabio",
			"1993",
			"Murg",
			"1:54.07,7"
		],
		[
			"42-Men",
			"4817",
			"Gienuth Hansjörg",
			"1968",
			"Murg",
			"2:43.15,6"
		],
		[
			"42-Men",
			"4597",
			"Giger Martin",
			"1965",
			"Sevelen",
			"2:39.39,4"
		],
		[
			"42-Men",
			"7725",
			"Giger Patrick",
			"1985",
			"St.Gallen",
			"3:52.02,8"
		],
		[
			"42-Wom",
			"342",
			"Giger Ramona",
			"1983",
			"Schänis",
			"2:15.11,3"
		],
		[
			"42-Men",
			"6176",
			"Giger Roman",
			"1982",
			"St.Gallen",
			"3:06.42,6"
		],
		[
			"42-Men",
			"3445",
			"Gisler Thomas",
			"1990",
			"Libingen",
			"2:22.49,5"
		],
		[
			"42-Wom",
			"1923",
			"Glück Judith",
			"1979",
			"Frümsen",
			"3:39.25,6"
		],
		[
			"42-Men",
			"206",
			"Gmür Ivo",
			"1980",
			"Amden",
			"1:35.14,3"
		],
		[
			"42-Men",
			"3826",
			"Gmür Karl",
			"1961",
			"Schänis",
			"2:28.18,1"
		],
		[
			"42-Men",
			"1026",
			"Gmür Magnus",
			"1971",
			"Bütschwil",
			"1:49.30,0"
		],
		[
			"21-Wom",
			"559",
			"Gmür Margrit",
			"1963",
			"Amden",
			"1:54.40,2"
		],
		[
			"42-Men",
			"1601",
			"Gmür Patrick",
			"1978",
			"Bütschwil",
			"1:55.37,6"
		],
		[
			"42-Wom",
			"2428",
			"Göldi Barbara",
			"1979",
			"St.Gallen",
			"5:00.56,0"
		],
		[
			"42-Wom",
			"1063",
			"Good Karin",
			"1969",
			"St.Gallen",
			"2:58.21,2"
		],
		[
			"42-Men",
			"5253",
			"Good Lukas",
			"1983",
			"Oberschan",
			"2:50.59,2"
		],
		[
			"42-Men",
			"6878",
			"Good Pius",
			"1982",
			"Grabs",
			"3:22.35,5"
		],
		[
			"42-Men",
			"256",
			"Gort Sandro",
			"1985",
			"Vättis",
			"1:37.13,0"
		],
		[
			"42-Wom",
			"1896",
			"Gossner Berit",
			"1973",
			"Andwil",
			"3:37.55,3"
		],
		[
			"42-Men",
			"6265",
			"Gossner Roman",
			"1973",
			"Andwil",
			"3:08.15,2"
		],
		[
			"42-Men",
			"5344",
			"Gossweiler Laurenz",
			"1963",
			"Wattwil",
			"2:52.28,6"
		],
		[
			"42-Men",
			"2464",
			"Götte Michael",
			"1979",
			"Tübach",
			"2:08.24,9"
		],
		[
			"21-Men",
			"243",
			"Graf Markus",
			"1962",
			"Wattwil",
			"1:21.06,1"
		],
		[
			"42-Men",
			"2908",
			"Graf Markus",
			"1973",
			"Wil",
			"2:14.25,1"
		],
		[
			"42-Men",
			"1056",
			"Graf Michael",
			"1980",
			"Rebstein",
			"1:49.48,9"
		],
		[
			"42-Men",
			"1835",
			"Grau Madusch",
			"1965",
			"Niederuzwil",
			"1:59.02,6"
		],
		[
			"42-Men",
			"783",
			"Gremlich Lukas",
			"1991",
			"Jona",
			"1:46.14,6"
		],
		[
			"42-Men",
			"1546",
			"Grischott Reto",
			"1986",
			"Amden",
			"1:54.57,2"
		],
		[
			"21-Men",
			"112",
			"Grisendi Alberto",
			"1967",
			"Ebnat-Kappel",
			"1:09.58,6"
		],
		[
			"42-Men",
			"146",
			"Grob Armin",
			"1962",
			"Brunnadern",
			"1:31.26,3"
		],
		[
			"21-Wom",
			"62",
			"Grogg Alena",
			"2003",
			"Kaltbrunn",
			"1:18.05,0"
		],
		[
			"21-Wom",
			"240",
			"Grogg Diana",
			"1972",
			"Kaltbrunn",
			"1:34.09,9"
		],
		[
			"42-Men",
			"5365",
			"Gruber Andreas",
			"1985",
			"Sargans",
			"2:52.48,9"
		],
		[
			"42-Wom",
			"943",
			"Gruber Bigna",
			"1991",
			"Sargans",
			"2:52.55,1"
		],
		[
			"21-Wom",
			"867",
			"Gschwend Jessica",
			"2002",
			"Uzwil",
			"2:46.11,8"
		],
		[
			"42-Men",
			"3708",
			"Gschwend Paul",
			"1956",
			"Untereggen",
			"2:26.36,9"
		],
		[
			"42-Men",
			"4800",
			"Gübeli Marcel",
			"1968",
			"Goldingen",
			"2:42.55,7"
		],
		[
			"21-Wom",
			"731",
			"Gubser Raphaela",
			"1987",
			"Unterterzen",
			"2:12.23,1"
		],
		[
			"42-Men",
			"7691",
			"Gubser Samuel",
			"1984",
			"Walenstadt",
			"3:50.35,9"
		],
		[
			"21-Men",
			"874",
			"Gubser Simon",
			"1987",
			"Unterterzen",
			"2:12.26,9"
		],
		[
			"21-Men",
			"396",
			"Gunzenreiner Magnus",
			"1984",
			"St.Gallen",
			"1:31.58,7"
		],
		[
			"42-Wom",
			"725",
			"Gysin-Castelli Nuria",
			"1982",
			"Buchs",
			"2:40.07,7"
		],
		[
			"42-Men",
			"157",
			"Hafner Jan",
			"1996",
			"Mosnang",
			"1:32.57,5"
		],
		[
			"21-Men",
			"50",
			"Hafner Markus",
			"1964",
			"Mosnang",
			"58.11.9"
		],
		[
			"42-Men",
			"707",
			"Haltinner Köbi",
			"1984",
			"Ebnat-Kappel",
			"1:45.09,0"
		],
		[
			"42-Wom",
			"264",
			"Haltinner Yvonne",
			"1981",
			"Ebnat-Kappel",
			"2:07.58,7"
		],
		[
			"42-Men",
			"6628",
			"Häne Daniel",
			"1961",
			"Flawil",
			"3:16.04,5"
		],
		[
			"42-Men",
			"2805",
			"Häni Markus",
			"1973",
			"Mörschwil",
			"2:13.02,8"
		],
		[
			"21-Wom",
			"684",
			"Hardegger Olivia",
			"1994",
			"Jonschwil",
			"2:05.19,4"
		],
		[
			"42-Men",
			"7058",
			"Hartmann Daniel",
			"1979",
			"Ebnat-Kappel",
			"3:27.12,8"
		],
		[
			"42-Men",
			"4781",
			"Hartmann Peter",
			"1964",
			"Walenstadt",
			"2:42.29,7"
		],
		[
			"42-Men",
			"2473",
			"Hartmann Rainer-Erik",
			"1960",
			"Ebnat-Kappel",
			"2:08.28,1"
		],
		[
			"21-Men",
			"1007",
			"Hartmann Remo",
			"1957",
			"Berschis",
			"2:48.20,7"
		],
		[
			"42-Men",
			"977",
			"Hartmann Thomas",
			"1965",
			"Degersheim",
			"1:48.50,8"
		],
		[
			"21-Men",
			"1008",
			"Hartmann Ueli",
			"1984",
			"Mels",
			"2:48.23,9"
		],
		[
			"42-Men",
			"2587",
			"Hasler Reto",
			"1980",
			"Rorschacherberg",
			"2:10.07,7"
		],
		[
			"42-Wom",
			"466",
			"Haudenschild Helen",
			"1963",
			"Jona",
			"2:24.48,5"
		],
		[
			"42-Wom",
			"121",
			"Haudenschild Livia",
			"1994",
			"Jona",
			"1:54.08,8"
		],
		[
			"21-Men",
			"225",
			"Haudenschild Werner",
			"1961",
			"Jona",
			"1:19.54,7"
		],
		[
			"42-Wom",
			"628",
			"Hauser Désirée",
			"2001",
			"Mörschwil",
			"2:34.49,6"
		],
		[
			"21-Men",
			"227",
			"Hauser Dominic",
			"2003",
			"Mörschwil",
			"1:19.59,0"
		],
		[
			"42-Men",
			"2321",
			"Hauser Patrick",
			"1969",
			"Mörschwil",
			"2:06.09,4"
		],
		[
			"42-Men",
			"4305",
			"Heeb Alfons",
			"1953",
			"Altstätten",
			"2:35.17,1"
		],
		[
			"42-Men",
			"3958",
			"Heerdegen Beat",
			"1970",
			"Niederuzwil",
			"2:30.22,4"
		],
		[
			"42-Men",
			"8361",
			"Heerdegen Philipp",
			"1936",
			"Flawil",
			"4:42.17,5"
		],
		[
			"42-Men",
			"6190",
			"Helfenberger Beat",
			"1983",
			"Abtwil",
			"3:06.58,2"
		],
		[
			"42-Men",
			"4011",
			"Helfenberger Marco",
			"1986",
			"St.Gallen",
			"2:31.15,6"
		],
		[
			"42-Men",
			"1797",
			"Helfenberger Roman",
			"1983",
			"Muolen",
			"1:58.22,7"
		],
		[
			"21-Men",
			"676",
			"Helfenstein Seth Flori",
			"1988",
			"St.Gallen",
			"1:51.11,4"
		],
		[
			"42-Men",
			"5067",
			"Hempfling Michael",
			"1971",
			"Oberuzwil",
			"2:47.16,8"
		],
		[
			"42-Men",
			"3116",
			"Henkel Thomas",
			"1970",
			"St.Gallen",
			"2:17.41,0"
		],
		[
			"42-Men",
			"1187",
			"Hermann Andreas",
			"1983",
			"Jona",
			"1:51.09,5"
		],
		[
			"42-Wom",
			"1875",
			"Hermann Jasmin",
			"1999",
			"Sargans",
			"3:36.35,2"
		],
		[
			"42-Men",
			"2229",
			"Herzog Daniel",
			"1968",
			"Rorschacherberg",
			"2:05.00,5"
		],
		[
			"21-Wom",
			"335",
			"Heuberger Andrea",
			"1975",
			"Wil",
			"1:40.30,9"
		],
		[
			"42-Wom",
			"138",
			"Heule Claudia",
			"1982",
			"Rorschacherberg",
			"1:55.19,8"
		],
		[
			"42-Wom",
			"1483",
			"Heule Veronika",
			"1978",
			"Benken",
			"3:16.40,0"
		],
		[
			"42-Men",
			"1693",
			"Hiestand Thomas",
			"1964",
			"Rorschach",
			"1:56.52,1"
		],
		[
			"42-Wom",
			"1538",
			"Hirsch Claudia",
			"1968",
			"Mörschwil",
			"3:18.48,9"
		],
		[
			"42-Men",
			"223",
			"Hobi Andreas",
			"1984",
			"Mels",
			"1:36.13,4"
		],
		[
			"42-Men",
			"5363",
			"Hobi Daniel",
			"1984",
			"Mels",
			"2:52.44,4"
		],
		[
			"42-Men",
			"5360",
			"Hobi Hannes",
			"1991",
			"Mels",
			"2:52.42,5"
		],
		[
			"21-Wom",
			"623",
			"Hobi Helen",
			"1992",
			"Rapperswil",
			"1:59.16,0"
		],
		[
			"42-Wom",
			"1564",
			"Hobi Julia",
			"1993",
			"St.Gallen",
			"3:20.10,5"
		],
		[
			"42-Men",
			"2111",
			"Hofer Pierre",
			"1955",
			"St.Gallen",
			"2:03.13,8"
		],
		[
			"42-Wom",
			"375",
			"Hofstetter Corinne",
			"1963",
			"St.Gallen",
			"2:18.18,7"
		],
		[
			"42-Men",
			"3664",
			"Hofstetter Fabian",
			"1984",
			"Rapperswil",
			"2:26.02,4"
		],
		[
			"42-Men",
			"1800",
			"Hofstetter Peter",
			"1984",
			"Wildhaus",
			"1:58.26,6"
		],
		[
			"42-Wom",
			"1808",
			"Hoegger Susanne",
			"1966",
			"St.Gallen",
			"3:32.14,6"
		],
		[
			"42-Men",
			"909",
			"Holenstein Joel",
			"1995",
			"Gähwil",
			"1:47.57,4"
		],
		[
			"42-Men",
			"5774",
			"Hollenstein Alexander",
			"1964",
			"Bütschwil",
			"2:59.37,0"
		],
		[
			"42-Men",
			"2328",
			"Hollenstein Patrick",
			"1993",
			"Ricken",
			"2:06.16,6"
		],
		[
			"42-Wom",
			"1652",
			"Hollenstein Petra",
			"1989",
			"Bütschwil",
			"3:24.26,4"
		],
		[
			"42-Men",
			"174",
			"Hollenstein Silvan",
			"1992",
			"Mühlrüti",
			"1:33.08,6"
		],
		[
			"42-Men",
			"7582",
			"Horber Werner",
			"1959",
			"Berschis",
			"3:45.12,2"
		],
		[
			"42-Men",
			"4874",
			"Hösli Urs",
			"1978",
			"Weesen",
			"2:44.07,6"
		],
		[
			"42-Men",
			"6806",
			"Hospenthal Benjamin",
			"1986",
			"St.Gallen",
			"3:20.34,4"
		],
		[
			"42-Men",
			"6391",
			"Huber Michael",
			"1973",
			"Steinach",
			"3:10.25,2"
		],
		[
			"42-Men",
			"2190",
			"Hüberli Peter",
			"1965",
			"Lichtensteig",
			"2:04.14,1"
		],
		[
			"42-Men",
			"4623",
			"Hug Ralph",
			"1954",
			"St.Gallen",
			"2:40.01,6"
		],
		[
			"42-Men",
			"803",
			"Hug Roman",
			"1974",
			"Lichtensteig",
			"1:46.22,7"
		],
		[
			"42-Men",
			"3470",
			"Hummel Cornelius",
			"1999",
			"St.Gallen",
			"2:23.08,1"
		],
		[
			"21-Men",
			"701",
			"Hummel Peter",
			"1953",
			"St.Gallen",
			"1:52.57,8"
		],
		[
			"21-Men",
			"101",
			"Hürlimann Linard",
			"2004",
			"Bad Ragaz",
			"1:09.11,0"
		],
		[
			"42-Men",
			"5032",
			"Hürlimann Thomas",
			"1966",
			"Bad Ragaz",
			"2:46.46,8"
		],
		[
			"42-Wom",
			"1073",
			"Inauen Judith",
			"1972",
			"St.Gallen",
			"2:58.54,3"
		],
		[
			"42-Men",
			"1556",
			"Inhelder Urs",
			"1971",
			"Sennwald",
			"1:55.07,7"
		],
		[
			"21-Wom",
			"229",
			"Isenrich Sonja",
			"1990",
			"St.Gallen",
			"1:33.29,1"
		],
		[
			"42-Men",
			"2939",
			"Isenrich Thomas",
			"1984",
			"St.Gallen",
			"2:15.00,3"
		],
		[
			"42-Men",
			"5823",
			"Iten Thomas",
			"1981",
			"St.Gallen",
			"3:00.19,4"
		],
		[
			"42-Wom",
			"36",
			"Jäger Barbara",
			"1989",
			"Vättis",
			"1:40.47,5"
		],
		[
			"42-Men",
			"8084",
			"Jaeger Benno",
			"1943",
			"Vättis",
			"4:15.31,4"
		],
		[
			"42-Men",
			"4923",
			"Jäger Bruno",
			"1968",
			"Ganterschwil",
			"2:44.47,5"
		],
		[
			"42-Men",
			"5464",
			"Jäger Bruno",
			"1964",
			"Wil",
			"2:54.39,5"
		],
		[
			"42-Wom",
			"52",
			"Jäger Christa",
			"1992",
			"St.Margrethen",
			"1:44.30,8"
		],
		[
			"21-Wom",
			"536",
			"Jäger Christina",
			"1995",
			"Wil",
			"1:52.24,4"
		],
		[
			"42-Men",
			"2540",
			"Jäger Ernst",
			"1948",
			"Vättis",
			"2:09.30,4"
		],
		[
			"21-Men",
			"391",
			"Jaeger Guido",
			"1956",
			"Murg",
			"1:31.30,2"
		],
		[
			"42-Men",
			"6440",
			"Jäger Lukas",
			"1995",
			"Altstätten",
			"3:11.41,0"
		],
		[
			"42-Men",
			"7822",
			"Jäger Marwin",
			"1996",
			"Wil",
			"3:56.35,1"
		],
		[
			"42-Men",
			"3307",
			"Jöhl Hans",
			"1959",
			"Amden",
			"2:20.41,1"
		],
		[
			"21-Men",
			"213",
			"Jörger Urs Manuel",
			"1989",
			"Sargans",
			"1:18.50,8"
		],
		[
			"42-Wom",
			"1742",
			"Jost Corina",
			"1985",
			"St.Gallen",
			"3:28.56,4"
		],
		[
			"42-Men",
			"4580",
			"Jost Stephan",
			"1969",
			"Rapperswil",
			"2:39.17,7"
		],
		[
			"42-Men",
			"3226",
			"Jud Andreas",
			"1991",
			"Mels",
			"2:19.35,1"
		],
		[
			"42-Men",
			"4726",
			"Jud Roger",
			"1986",
			"Maseltrangen",
			"2:41.48,2"
		],
		[
			"42-Wom",
			"1602",
			"Kalberer Monika",
			"1990",
			"Mels",
			"3:21.48,1"
		],
		[
			"42-Men",
			"2903",
			"Kalberer Ueli",
			"1978",
			"Mels",
			"2:14.19,2"
		],
		[
			"42-Men",
			"6775",
			"Kälin Armin",
			"1952",
			"Kaltbrunn",
			"3:19.49,6"
		],
		[
			"42-Wom",
			"2351",
			"Kälin Elisabeth",
			"1967",
			"Jona",
			"4:26.18,4"
		],
		[
			"42-Wom",
			"2348",
			"Kälin Nadine",
			"1994",
			"Jona",
			"4:25.12,8"
		],
		[
			"42-Wom",
			"2465",
			"Karrer Jasmin",
			"1987",
			"Wil",
			"2:40.30,9"
		],
		[
			"42-Men",
			"3315",
			"Kast Roger",
			"1978",
			"St.Gallen",
			"2:20.48,9"
		],
		[
			"42-Men",
			"866",
			"Kast Roland",
			"1971",
			"Berneck",
			"1:47.22,0"
		],
		[
			"42-Wom",
			"1022",
			"Kaufmann Mauritia",
			"1991",
			"St.Gallen",
			"2:56.19,6"
		],
		[
			"42-Men",
			"832",
			"Kaufmann Rolf",
			"1965",
			"Jona",
			"1:46.51,0"
		],
		[
			"42-Men",
			"6837",
			"Kaurola Matti",
			"1996",
			"St.Gallen",
			"3:21.26,1"
		],
		[
			"42-Men",
			"5076",
			"Kedziora Thomas",
			"1987",
			"St.Gallen",
			"2:47.24,3"
		],
		[
			"42-Men",
			"646",
			"Keel Lukas",
			"1967",
			"Sargans",
			"1:44.21,7"
		],
		[
			"42-Men",
			"5252",
			"Keel Thomas",
			"1964",
			"Bad Ragaz",
			"2:50.58,9"
		],
		[
			"21-Wom",
			"324",
			"Kellenberger Elisabeth",
			"1962",
			"Wil",
			"1:39.51,8"
		],
		[
			"21-Wom",
			"865",
			"Keller Barbara",
			"1965",
			"Flawil",
			"2:46.08,8"
		],
		[
			"42-Men",
			"4293",
			"Keller-Caglia Cornel",
			"1969",
			"Andwil",
			"2:35.05,3"
		],
		[
			"42-Men",
			"1157",
			"Keller Franz",
			"1968",
			"Altstätten",
			"1:50.54,1"
		],
		[
			"21-Wom",
			"106",
			"Keller Gianna",
			"2002",
			"Andwil",
			"1:23.16,7"
		],
		[
			"42-Men",
			"6354",
			"Keller Hans",
			"1955",
			"Waldkirch",
			"3:09.57,9"
		],
		[
			"42-Men",
			"5022",
			"Keller Ivo",
			"1970",
			"Gommiswald",
			"2:46.39,3"
		],
		[
			"42-Men",
			"3918",
			"Keller Ivo",
			"1973",
			"Bütschwil",
			"2:29.53,1"
		],
		[
			"21-Wom",
			"587",
			"Keller Jacqueline",
			"1997",
			"Rorschach",
			"1:57.06,3"
		],
		[
			"42-Men",
			"4969",
			"Keller Rolf",
			"1961",
			"Wattwil",
			"2:45.33,6"
		],
		[
			"42-Men",
			"1913",
			"Keller Silvio",
			"1990",
			"Bächli (Hemberg)",
			"2:00.09,8"
		],
		[
			"42-Men",
			"4700",
			"Kessler Thomas",
			"1977",
			"Flums",
			"2:41.21,1"
		],
		[
			"21-Men",
			"602",
			"Keuschnig Florian",
			"1986",
			"St.Gallen",
			"1:45.35,6"
		],
		[
			"21-Men",
			"429",
			"Khomyanin Alexey",
			"1979",
			"Moscow",
			"1:35.11,6"
		],
		[
			"42-Men",
			"14",
			"Klee Beda",
			"1996",
			"Wattwil",
			"1:23.43,6"
		],
		[
			"42-Men",
			"5181",
			"Kleger Christian",
			"1961",
			"Mörschwil",
			"2:49.33,1"
		],
		[
			"42-Men",
			"3318",
			"Kleger Florian",
			"1989",
			"St.Gallen",
			"2:20.51,0"
		],
		[
			"42-Men",
			"7730",
			"Klement Domenic",
			"1983",
			"Rorschach",
			"3:52.14,1"
		],
		[
			"42-Wom",
			"722",
			"Kliebens Jeannette",
			"1960",
			"Rossrüti",
			"2:39.58,4"
		],
		[
			"21-Wom",
			"646",
			"Kluser Beatrice",
			"1961",
			"Gams",
			"2:01.23,4"
		],
		[
			"42-Men",
			"3629",
			"Knaus Pascal",
			"1979",
			"Wil",
			"2:25.22,2"
		],
		[
			"42-Men",
			"2422",
			"Knechtle Cyrill",
			"1997",
			"Mörschwil",
			"2:07.37,3"
		],
		[
			"21-Men",
			"999",
			"Knellwolf Jannic",
			"2001",
			"Flawil",
			"2:46.11,8"
		],
		[
			"42-Wom",
			"221",
			"Knill Andrea",
			"1967",
			"Niederbüren",
			"2:04.21,7"
		],
		[
			"42-Men",
			"8030",
			"Kobelt Kuno",
			"1939",
			"Marbach",
			"4:11.04,2"
		],
		[
			"42-Men",
			"4764",
			"Kobler Daniel",
			"1966",
			"Oberriet",
			"2:42.20,1"
		],
		[
			"42-Men",
			"1851",
			"Kobler Jürg",
			"1978",
			"Oberriet",
			"1:59.16,9"
		],
		[
			"42-Men",
			"5615",
			"Kofler Bernhard",
			"1968",
			"Lenggenwil",
			"2:57.12,5"
		],
		[
			"42-Men",
			"1307",
			"Kohler Jan",
			"2000",
			"Vättis",
			"1:52.37,1"
		],
		[
			"42-Men",
			"3783",
			"Kohler Joel",
			"1997",
			"Vättis",
			"2:27.39,5"
		],
		[
			"42-Men",
			"1920",
			"Kohler Mario",
			"1991",
			"Vättis",
			"2:00.14,8"
		],
		[
			"42-Men",
			"5088",
			"Kohler Rudolf",
			"1950",
			"Vättis",
			"2:47.42,0"
		],
		[
			"42-Wom",
			"2137",
			"Kohler Samira",
			"1995",
			"Mels",
			"3:55.09,6"
		],
		[
			"42-Wom",
			"1338",
			"Koller Elena",
			"1994",
			"Gossau",
			"3:10.12,9"
		],
		[
			"42-Men",
			"7913",
			"Koller Manuel",
			"1981",
			"Wil",
			"4:02.09,8"
		],
		[
			"42-Wom",
			"1066",
			"Koller Sara",
			"1996",
			"Gams",
			"2:58.35,9"
		],
		[
			"42-Men",
			"2440",
			"Koller Valentin",
			"1988",
			"Wattwil",
			"2:08.03,6"
		],
		[
			"42-Men",
			"1196",
			"Kollmann Urs",
			"1968",
			"Wattwil",
			"1:51.16,3"
		],
		[
			"42-Men",
			"6432",
			"König Stefan",
			"1984",
			"St.Gallen",
			"3:11.32,8"
		],
		[
			"42-Men",
			"5041",
			"Kopp Christian",
			"1969",
			"Goldach",
			"2:46.51,1"
		],
		[
			"42-Men",
			"6641",
			"Kradolfer Urs",
			"1955",
			"Buchs",
			"3:16.17,0"
		],
		[
			"42-Men",
			"918",
			"Kraft André",
			"1977",
			"Andwil",
			"1:48.10,3"
		],
		[
			"42-Wom",
			"810",
			"Kraft Anni",
			"1948",
			"Andwil",
			"2:45.11,6"
		],
		[
			"42-Men",
			"2291",
			"Kraft Daniel",
			"1976",
			"Azmoos",
			"2:05.43,8"
		],
		[
			"42-Men",
			"1515",
			"Krähenbühl Matthias",
			"1988",
			"Jona",
			"1:54.40,7"
		],
		[
			"42-Men",
			"830",
			"Krähenbühl Simon",
			"1985",
			"Rapperswil",
			"1:46.48,5"
		],
		[
			"42-Men",
			"5646",
			"Kral Roman",
			"1989",
			"Lichtensteig",
			"2:57.31,1"
		],
		[
			"42-Men",
			"6298",
			"Kramer Manuel",
			"1994",
			"Flawil",
			"3:08.44,7"
		],
		[
			"21-Men",
			"462",
			"Krebs Matthias",
			"1990",
			"Bad Ragaz",
			"1:36.43,1"
		],
		[
			"21-Wom",
			"293",
			"Kreis Anina",
			"1988",
			"Sargans",
			"1:37.50,2"
		],
		[
			"42-Men",
			"290",
			"Kressig Michel",
			"1988",
			"Buchs",
			"1:38.23,0"
		],
		[
			"21-Men",
			"407",
			"Krug Jörg",
			"1968",
			"Oberbüren",
			"1:33.39,7"
		],
		[
			"42-Men",
			"5955",
			"Krüsi Niklaus",
			"1951",
			"Henau",
			"3:02.24,4"
		],
		[
			"42-Men",
			"2793",
			"Kühne Remo",
			"1981",
			"Neuhaus",
			"2:12.54,6"
		],
		[
			"42-Men",
			"4925",
			"Kühne Stefan",
			"1992",
			"Mels",
			"2:44.48,5"
		],
		[
			"42-Men",
			"3183",
			"Kühne Thomas",
			"1989",
			"Bad Ragaz",
			"2:18.47,0"
		],
		[
			"42-Men",
			"6019",
			"Kundela Franz",
			"1951",
			"St.Gallen",
			"3:03.38,7"
		],
		[
			"21-Men",
			"180",
			"Kunfermann Ruedi",
			"1988",
			"Jona",
			"1:15.59,2"
		],
		[
			"42-Wom",
			"1715",
			"Küng Fabia",
			"1988",
			"Wattwil",
			"3:27.16,3"
		],
		[
			"42-Men",
			"1891",
			"Küng Kurt",
			"1955",
			"Wattwil",
			"1:59.47,2"
		],
		[
			"21-Wom",
			"534",
			"Küng Nicole",
			"1984",
			"Wil",
			"1:52.22,9"
		],
		[
			"42-Wom",
			"886",
			"Küng Olivia",
			"1986",
			"Bütschwil",
			"2:49.21,6"
		],
		[
			"42-Men",
			"3225",
			"Kunz Cyrill",
			"2000",
			"Mels",
			"2:19.34,7"
		],
		[
			"42-Wom",
			"905",
			"Künzler Monika",
			"1976",
			"Flawil",
			"2:50.52,9"
		],
		[
			"42-Wom",
			"2480",
			"Kurath Andrea",
			"1964",
			"Bad Ragaz",
			"2:23.51,7"
		],
		[
			"21-Men",
			"436",
			"Kurath René",
			"1954",
			"Sargans",
			"1:35.31,6"
		],
		[
			"42-Men",
			"904",
			"Kuratli Adrian",
			"1991",
			"Neuhaus",
			"1:47.51,7"
		],
		[
			"42-Men",
			"840",
			"Kuratli Gerry",
			"1994",
			"Nesslau",
			"1:46.58,6"
		],
		[
			"42-Men",
			"3716",
			"Kurer Christoph",
			"1944",
			"St.Gallen",
			"2:26.44,9"
		],
		[
			"42-Men",
			"5564",
			"Kuster Franz",
			"1952",
			"Schmerikon",
			"2:56.21,6"
		],
		[
			"42-Men",
			"2647",
			"Kuster Mario",
			"1989",
			"Jona",
			"2:10.51,7"
		],
		[
			"42-Men",
			"5370",
			"Kuster René",
			"1980",
			"Gommiswald",
			"2:52.52,0"
		],
		[
			"21-Men",
			"142",
			"Lacher Josef",
			"1956",
			"Jona",
			"1:12.53,1"
		],
		[
			"42-Men",
			"7097",
			"Landert Rainer",
			"1958",
			"Rapperswil",
			"3:28.16,5"
		],
		[
			"42-Men",
			"5299",
			"Lang Gregor",
			"1989",
			"Mosnang",
			"2:51.39,7"
		],
		[
			"42-Men",
			"7670",
			"Langenegger Ernst",
			"1964",
			"Tübach",
			"3:49.33,4"
		],
		[
			"42-Men",
			"796",
			"Langenegger Frank",
			"1968",
			"Hinterforst",
			"1:46.19,5"
		],
		[
			"42-Wom",
			"1545",
			"Langenegger Heidi",
			"1991",
			"Altstätten",
			"3:19.10,5"
		],
		[
			"42-Wom",
			"1627",
			"Langenegger Trix",
			"1963",
			"Altstätten",
			"3:22.48,4"
		],
		[
			"21-Men",
			"515",
			"Langenegger Urs",
			"1993",
			"Altstätten",
			"1:40.32,7"
		],
		[
			"42-Men",
			"5848",
			"Ledergerber Benedikt",
			"1987",
			"Waldkirch",
			"3:00.39,4"
		],
		[
			"42-Men",
			"7093",
			"Leemann David",
			"1982",
			"Abtwil",
			"3:28.12,1"
		],
		[
			"21-Wom",
			"278",
			"Lehmann Kristina",
			"1994",
			"Wattwil",
			"1:36.52,8"
		],
		[
			"42-Men",
			"265",
			"Lehmann Remy",
			"1997",
			"Wattwil",
			"1:37.33,1"
		],
		[
			"42-Men",
			"3632",
			"Lehmann Simon",
			"2002",
			"Wattwil",
			"2:25.25,1"
		],
		[
			"42-Men",
			"6005",
			"Lehmann Stephan",
			"1966",
			"Wattwil",
			"3:03.24,9"
		],
		[
			"42-Men",
			"3382",
			"Lehner Philipp",
			"1962",
			"Bad Ragaz",
			"2:21.44,6"
		],
		[
			"21-Wom",
			"502",
			"Lenz Martina",
			"1974",
			"St.Gallen",
			"1:50.34,4"
		],
		[
			"21-Wom",
			"582",
			"Leu-Flury Sabine",
			"1971",
			"Jona",
			"1:56.40,6"
		],
		[
			"42-Men",
			"4779",
			"Leu Thomas",
			"1968",
			"Jona",
			"2:42.28,9"
		],
		[
			"42-Men",
			"4772",
			"Leverkus Lennard",
			"1986",
			"Jona",
			"2:42.26,3"
		],
		[
			"42-Men",
			"1006",
			"Linder Walter",
			"1966",
			"Mörschwil",
			"1:49.17,4"
		],
		[
			"42-Men",
			"3728",
			"Lips David",
			"1970",
			"Jona",
			"2:26.57,3"
		],
		[
			"42-Men",
			"1811",
			"Litscher Christian",
			"1960",
			"Buchs",
			"1:58.34,4"
		],
		[
			"42-Men",
			"3780",
			"Loher Michael",
			"1971",
			"Sargans",
			"2:27.38,9"
		],
		[
			"42-Wom",
			"1345",
			"Loher Nadine",
			"1975",
			"Sargans",
			"3:10.29,7"
		],
		[
			"42-Men",
			"7811",
			"Looser Heinz",
			"1949",
			"Wittenbach",
			"3:55.49,0"
		],
		[
			"42-Men",
			"1184",
			"Lorenzi Remo",
			"1976",
			"St.Gallen",
			"1:51.09,1"
		],
		[
			"42-Wom",
			"596",
			"Lörtscher Prisca",
			"1976",
			"Weesen",
			"2:33.19,9"
		],
		[
			"42-Wom",
			"266",
			"Lüchinger Alexandra",
			"1985",
			"Hinterforst",
			"2:08.06,8"
		],
		[
			"21-Men",
			"55",
			"Lusti Julian",
			"2003",
			"Alt St.Johann",
			"58.52.0"
		],
		[
			"42-Men",
			"4755",
			"Lüthi Hans-Ruedi",
			"1971",
			"Wattwil",
			"2:42.13,8"
		],
		[
			"42-Men",
			"1297",
			"Mächler Andri",
			"1994",
			"Eschenbach",
			"1:52.26,8"
		],
		[
			"42-Men",
			"2746",
			"Maechler Daniel",
			"1957",
			"Eschenbach",
			"2:12.13,4"
		],
		[
			"42-Men",
			"2126",
			"Mäder Martin",
			"1973",
			"Wil",
			"2:03.20,1"
		],
		[
			"42-Men",
			"3764",
			"Mäder Stephan",
			"1976",
			"Wil",
			"2:27.28,7"
		],
		[
			"42-Wom",
			"62",
			"Magdika Simone",
			"1990",
			"Buchs",
			"1:46.39,3"
		],
		[
			"42-Men",
			"6575",
			"Mähne Joel",
			"1998",
			"Engelburg",
			"3:14.36,1"
		],
		[
			"42-Men",
			"7651",
			"Mahrle Gerhard",
			"1957",
			"Abtwil",
			"3:48.39,5"
		],
		[
			"42-Wom",
			"1888",
			"Mahrle Vivien",
			"1992",
			"St.Gallen",
			"3:37.29,4"
		],
		[
			"21-Wom",
			"733",
			"Manser Andrea",
			"1992",
			"St.Gallen",
			"2:12.45,9"
		],
		[
			"42-Wom",
			"1659",
			"Manser Monika",
			"1982",
			"Bad Ragaz",
			"3:24.45,1"
		],
		[
			"42-Men",
			"354",
			"Manser Philipp",
			"1987",
			"Mörschwil",
			"1:39.47,4"
		],
		[
			"42-Men",
			"314",
			"Manser Samuel",
			"1985",
			"Mörschwil",
			"1:39.09,3"
		],
		[
			"21-Wom",
			"678",
			"Manser Yvonne",
			"1990",
			"Schwarzenbach",
			"2:04.47,2"
		],
		[
			"42-Men",
			"8028",
			"Marcazzan Gilberto",
			"1973",
			"Abtwil",
			"4:10.58,3"
		],
		[
			"21-Wom",
			"371",
			"Maron Leonie",
			"1990",
			"St.Gallen",
			"1:42.24,5"
		],
		[
			"42-Men",
			"257",
			"Marquart Manuel",
			"1982",
			"Rebstein",
			"1:37.17,1"
		],
		[
			"42-Men",
			"7635",
			"Marte Andreas",
			"1990",
			"Altstätten",
			"3:48.07,6"
		],
		[
			"42-Men",
			"6471",
			"Marti Lukas",
			"1967",
			"St.Gallen",
			"3:12.22,1"
		],
		[
			"42-Men",
			"6206",
			"Marti Michael",
			"1968",
			"Rorschacherberg",
			"3:07.19,4"
		],
		[
			"42-Men",
			"7143",
			"Martin Maurice",
			"1995",
			"Gossau",
			"3:29.23,0"
		],
		[
			"21-Men",
			"466",
			"Martin Michael",
			"1977",
			"Abtwil",
			"1:36.53,7"
		],
		[
			"42-Wom",
			"1366",
			"Marty Claudia",
			"1986",
			"Kaltbrunn",
			"3:11.15,8"
		],
		[
			"42-Wom",
			"1300",
			"Mast Valerie",
			"1988",
			"Bad Ragaz",
			"3:08.46,0"
		],
		[
			"42-Men",
			"2139",
			"Mathies Andi",
			"1977",
			"Gommiswald",
			"2:03.29,9"
		],
		[
			"21-Wom",
			"745",
			"Matzner Aline",
			"1993",
			"St.Gallen",
			"2:14.12,5"
		],
		[
			"42-Men",
			"5983",
			"Mauchle Christian",
			"1989",
			"Gossau",
			"3:02.59,9"
		],
		[
			"21-Wom",
			"533",
			"Mauchle Monika",
			"1983",
			"Rorschacherberg",
			"1:52.22,0"
		],
		[
			"42-Wom",
			"1442",
			"Meier Brigitte",
			"1962",
			"Amden",
			"3:14.41,2"
		],
		[
			"42-Men",
			"1892",
			"Meier Christoph",
			"1954",
			"St.Gallen",
			"1:59.47,8"
		],
		[
			"21-Wom",
			"647",
			"Meier Jasmin",
			"1987",
			"Amden",
			"2:01.30,8"
		],
		[
			"42-Men",
			"5340",
			"Meier Roman",
			"1988",
			"Buchs",
			"2:52.23,2"
		],
		[
			"42-Men",
			"5782",
			"Meier Sepp",
			"1957",
			"Amden",
			"2:59.44,0"
		],
		[
			"42-Men",
			"4977",
			"Meile Martin",
			"1952",
			"St.Gallen",
			"2:45.44,1"
		],
		[
			"21-Men",
			"373",
			"Meli Marcel",
			"1985",
			"Sargans",
			"1:30.24,2"
		],
		[
			"42-Men",
			"7871",
			"Messmer Pascal",
			"1982",
			"St.Gallen",
			"3:59.29,7"
		],
		[
			"42-Men",
			"7245",
			"Mettler Paul",
			"1959",
			"Gossau",
			"3:32.38,0"
		],
		[
			"21-Men",
			"108",
			"Metzger Daniel",
			"1966",
			"Alt St.Johann",
			"1:09.39,3"
		],
		[
			"42-Men",
			"1660",
			"Metzger René",
			"1970",
			"Alt St.Johann",
			"1:56.27,7"
		],
		[
			"42-Men",
			"758",
			"Metzler Daniel",
			"1967",
			"Goldach",
			"1:45.56,1"
		],
		[
			"42-Men",
			"4987",
			"Meuli Lorenz",
			"1990",
			"St.Gallen",
			"2:45.56,3"
		],
		[
			"42-Men",
			"2163",
			"Meyer Martin",
			"1956",
			"Nesslau",
			"2:03.50,6"
		],
		[
			"42-Men",
			"3348",
			"Monastra Alessandro",
			"1972",
			"Altstätten",
			"2:21.15,9"
		],
		[
			"42-Wom",
			"1085",
			"Monastra Nicole",
			"1972",
			"Altstätten",
			"2:59.34,8"
		],
		[
			"21-Wom",
			"176",
			"Moosmann Maira",
			"1987",
			"St.Gallen",
			"1:29.33,6"
		],
		[
			"42-Men",
			"2264",
			"Morger Patrik",
			"1973",
			"Uznach",
			"2:05.20,5"
		],
		[
			"42-Wom",
			"436",
			"Morger Sibylle",
			"1976",
			"Uznach",
			"2:22.44,6"
		],
		[
			"42-Men",
			"528",
			"Morger Stefan",
			"1980",
			"Uetliburg",
			"1:42.50,3"
		],
		[
			"42-Wom",
			"2234",
			"Moser Bettina",
			"1990",
			"Wittenbach",
			"4:05.33,9"
		],
		[
			"42-Men",
			"7854",
			"Moser Ernst Walter",
			"1946",
			"Zuzwil",
			"3:58.24,3"
		],
		[
			"42-Men",
			"6189",
			"Mösle Samuel",
			"1987",
			"St.Gallen",
			"3:06.55,7"
		],
		[
			"42-Men",
			"5531",
			"Mösli Robin",
			"1990",
			"Zuzwil",
			"2:55.53,9"
		],
		[
			"42-Men",
			"5533",
			"Mösli Urs",
			"1964",
			"Zuzwil",
			"2:55.56,1"
		],
		[
			"21-Men",
			"524",
			"Mrawek Thomas",
			"1967",
			"Maseltrangem",
			"1:41.04,6"
		],
		[
			"42-Wom",
			"524",
			"Mueggler Eliane",
			"1994",
			"Thal",
			"2:28.34,3"
		],
		[
			"21-Wom",
			"629",
			"Mühlethaler Claudia",
			"1969",
			"Wangs",
			"1:59.40,9"
		],
		[
			"42-Men",
			"7524",
			"Müller Benno",
			"1962",
			"Jona",
			"3:43.11,1"
		],
		[
			"42-Men",
			"4556",
			"Müller Emil",
			"1968",
			"St.Gallen",
			"2:38.56,7"
		],
		[
			"42-Men",
			"7195",
			"Müller Gebhard",
			"1942",
			"Steinach",
			"3:31.05,0"
		],
		[
			"42-Men",
			"7936",
			"Müller Joel",
			"1996",
			"Wattwil",
			"4:03.48,0"
		],
		[
			"42-Men",
			"2143",
			"Müller Mathias",
			"1985",
			"St.Gallen",
			"2:03.34,1"
		],
		[
			"42-Wom",
			"2223",
			"Müller Melanie",
			"1992",
			"Wattwil",
			"4:03.44,8"
		],
		[
			"42-Men",
			"1031",
			"Müller René",
			"1975",
			"Hemberg",
			"1:49.32,8"
		],
		[
			"42-Wom",
			"738",
			"Müller Ruth",
			"1967",
			"Jona",
			"2:40.57,7"
		],
		[
			"42-Wom",
			"831",
			"Müller Seraina",
			"1999",
			"Grabs",
			"2:46.02,2"
		],
		[
			"42-Men",
			"3250",
			"Müller Stefan",
			"1984",
			"Bütschwil",
			"2:19.54,4"
		],
		[
			"21-Wom",
			"230",
			"Müller Ursina",
			"2001",
			"Grabs",
			"1:33.30,1"
		],
		[
			"21-Wom",
			"451",
			"Müllhaupt Fabienne",
			"1985",
			"Wattwil",
			"1:47.18,7"
		],
		[
			"42-Men",
			"1473",
			"Murer Beat",
			"1965",
			"Jona",
			"1:54.14,7"
		],
		[
			"42-Men",
			"1382",
			"Mutzner Sämi",
			"1993",
			"Altstätten",
			"1:53.19,0"
		],
		[
			"21-Wom",
			"279",
			"Naef Karin",
			"1996",
			"Gossau",
			"1:36.53,5"
		],
		[
			"42-Men",
			"2379",
			"Naef Patrick",
			"1969",
			"Brunnadern",
			"2:06.59,3"
		],
		[
			"42-Men",
			"1965",
			"Näf Raphael",
			"1978",
			"Bütschwil",
			"2:00.58,4"
		],
		[
			"42-Men",
			"5772",
			"Napieralski Fabian",
			"1975",
			"St.Gallen",
			"2:59.35,7"
		],
		[
			"42-Men",
			"925",
			"Nauer Patrick",
			"1972",
			"Jona",
			"1:48.16,3"
		],
		[
			"42-Men",
			"1060",
			"Neff Christian",
			"1982",
			"Arnegg",
			"1:49.52,2"
		],
		[
			"42-Men",
			"1586",
			"Neuhauser Robert",
			"1967",
			"Rorschacherberg",
			"1:55.30,3"
		],
		[
			"42-Men",
			"5239",
			"Neuhold Christoph",
			"1962",
			"Altstätten",
			"2:50.41,5"
		],
		[
			"42-Men",
			"6525",
			"Neuhold Thomas",
			"1963",
			"Rüthi",
			"3:13.28,0"
		],
		[
			"42-Men",
			"1669",
			"Neyer Ivan",
			"1983",
			"Buchs",
			"1:56.34,4"
		],
		[
			"21-Wom",
			"140",
			"Neyer Monika",
			"1986",
			"Buchs",
			"1:26.30,3"
		],
		[
			"21-Wom",
			"361",
			"Niederer Simone",
			"1975",
			"Engelburg",
			"1:41.57,7"
		],
		[
			"42-Men",
			"403",
			"Nigg Lars",
			"2002",
			"Vättis",
			"1:40.50,4"
		],
		[
			"42-Men",
			"1576",
			"Nigg Stefan",
			"1974",
			"Vättis",
			"1:55.19,6"
		],
		[
			"42-Men",
			"3556",
			"Noi Patrick",
			"1990",
			"Eschenbach",
			"2:24.25,3"
		],
		[
			"42-Wom",
			"923",
			"Oberholzer Alina",
			"1996",
			"Waldkirch",
			"2:51.46,4"
		],
		[
			"42-Men",
			"3608",
			"Oberholzer Felix",
			"1965",
			"Waldkirch",
			"2:25.04,8"
		],
		[
			"21-Wom",
			"557",
			"Oberholzer Francine",
			"1999",
			"Waldkirch",
			"1:54.33,4"
		],
		[
			"42-Men",
			"4021",
			"Oberholzer Silvan",
			"1994",
			"Waldkirch",
			"2:31.27,8"
		],
		[
			"42-Men",
			"4654",
			"Oehler Dominik",
			"1967",
			"Zuckenriet",
			"2:40.38,7"
		],
		[
			"21-Men",
			"997",
			"Oehler Simon",
			"2002",
			"Zuckenriet",
			"2:46.00,8"
		],
		[
			"42-Men",
			"5962",
			"Oertig Marcel",
			"1989",
			"Gossau",
			"3:02.33,9"
		],
		[
			"42-Men",
			"6504",
			"Oertig Simon",
			"1995",
			"Gossau",
			"3:12.50,9"
		],
		[
			"42-Men",
			"7023",
			"Oesch Stefan",
			"1983",
			"St.Gallen",
			"3:26.25,7"
		],
		[
			"42-Men",
			"905",
			"Oie Geir",
			"1992",
			"St.Gallen",
			"1:47.52,7"
		],
		[
			"42-Men",
			"4374",
			"Oswald Jakob",
			"1982",
			"Sargans",
			"2:36.10,6"
		],
		[
			"42-Wom",
			"1126",
			"Ott Karin",
			"1965",
			"Walenstadt",
			"3:01.05,9"
		],
		[
			"42-Men",
			"7745",
			"Ottiger Sven",
			"1970",
			"Uzwil",
			"3:53.02,8"
		],
		[
			"42-Men",
			"7679",
			"Pavlovic Voji",
			"1954",
			"Frümsen",
			"3:50.04,9"
		],
		[
			"42-Wom",
			"79",
			"Pawlik Dolores",
			"1973",
			"Valens",
			"1:49.34,8"
		],
		[
			"42-Wom",
			"1430",
			"Peterer Kathrin",
			"1974",
			"Steinach",
			"3:14.00,9"
		],
		[
			"21-Men",
			"1000",
			"Peterer Walter",
			"1936",
			"Steinach",
			"2:46.18,4"
		],
		[
			"42-Men",
			"6976",
			"Pettineo Fabio",
			"1987",
			"Sevelen",
			"3:25.11,0"
		],
		[
			"42-Men",
			"5497",
			"Pfiffner Marco",
			"1987",
			"Sargans",
			"2:55.08,6"
		],
		[
			"42-Men",
			"5610",
			"Pfiffner Peter",
			"1965",
			"Sargans",
			"2:57.05,3"
		],
		[
			"42-Wom",
			"484",
			"Philipp Ursina",
			"1973",
			"Bad Ragaz",
			"2:25.57,3"
		],
		[
			"21-Men",
			"976",
			"Planzer Roger",
			"1982",
			"St.Gallen",
			"2:37.27,5"
		],
		[
			"21-Men",
			"459",
			"Pleier Immanuel",
			"1986",
			"Rapperswil",
			"1:36.34,4"
		],
		[
			"21-Men",
			"217",
			"Pollak David",
			"2003",
			"Jona",
			"1:19.25,8"
		],
		[
			"42-Wom",
			"80",
			"Pollak Marie",
			"1970",
			"Jona",
			"1:49.35,9"
		],
		[
			"21-Men",
			"547",
			"Pollak Peter",
			"1938",
			"Jona",
			"1:42.11,6"
		],
		[
			"42-Men",
			"5241",
			"Poltéra Lauren",
			"2001",
			"Mörschwil",
			"2:50.48,3"
		],
		[
			"42-Men",
			"4973",
			"Poltéra Roger",
			"1968",
			"Mörschwil",
			"2:45.37,4"
		],
		[
			"42-Men",
			"1838",
			"Pool Romano",
			"1955",
			"Uznach",
			"1:59.04,9"
		],
		[
			"42-Men",
			"7416",
			"Popp Matthias",
			"1984",
			"St.Gallen",
			"3:39.18,2"
		],
		[
			"21-Wom",
			"247",
			"Porchet Marlise",
			"1963",
			"Ulisbach",
			"1:34.21,6"
		],
		[
			"42-Men",
			"8349",
			"Puangmalai Oliver",
			"1981",
			"Sargans",
			"5:42.59,4"
		],
		[
			"42-Men",
			"4734",
			"Queisser Torsten",
			"1978",
			"Widnau",
			"2:41.54,7"
		],
		[
			"42-Men",
			"6494",
			"Räber Roland",
			"1974",
			"Jona",
			"3:12.39,5"
		],
		[
			"42-Men",
			"6794",
			"Raith Marco",
			"1990",
			"St.Gallen",
			"3:20.11,0"
		],
		[
			"42-Wom",
			"326",
			"Ramseier Alessia",
			"1988",
			"Jona",
			"2:14.19,8"
		],
		[
			"42-Men",
			"3815",
			"Räss Dario",
			"1993",
			"Häggenschwil",
			"2:28.05,5"
		],
		[
			"42-Wom",
			"352",
			"Rechsteiner Claudia",
			"1986",
			"Rorschacherberg",
			"2:16.37,6"
		],
		[
			"42-Men",
			"1710",
			"Rechsteiner Pirmin",
			"1987",
			"Andwil",
			"1:57.13,3"
		],
		[
			"42-Men",
			"605",
			"Reck Fabian",
			"1987",
			"Rapperswil",
			"1:43.42,1"
		],
		[
			"42-Wom",
			"759",
			"Reicherter Daniela",
			"1978",
			"St.Gallen",
			"2:41.56,7"
		],
		[
			"42-Wom",
			"1478",
			"Reichmuth Bettina",
			"1986",
			"Grabs",
			"3:16.10,4"
		],
		[
			"42-Wom",
			"769",
			"Reichmuth Martha",
			"1957",
			"Frümsen",
			"2:42.38,3"
		],
		[
			"42-Men",
			"1748",
			"Reichmuth Peter",
			"1973",
			"Eschenbach",
			"1:57.42,6"
		],
		[
			"42-Men",
			"2719",
			"Rentzmann Cornel",
			"1977",
			"Zuzwil",
			"2:11.50,3"
		],
		[
			"42-Men",
			"1612",
			"Rentzmann Pascal",
			"1970",
			"Engelburg",
			"1:55.45,9"
		],
		[
			"42-Men",
			"1986",
			"Resegatti Diego",
			"1986",
			"Rapperswil",
			"2:01.12,0"
		],
		[
			"42-Men",
			"6066",
			"Reus Chris",
			"1978",
			"Schmerikon",
			"3:04.20,7"
		],
		[
			"42-Men",
			"1977",
			"Richle Stefan",
			"1983",
			"Wattwil",
			"2:01.07,2"
		],
		[
			"42-Men",
			"2726",
			"Rieben Erhard",
			"1959",
			"Rapperswil",
			"2:11.56,9"
		],
		[
			"42-Men",
			"863",
			"Riesen André",
			"1975",
			"Heiligkreuz (Mels)",
			"1:47.19,8"
		],
		[
			"42-Men",
			"5303",
			"Rinderer Marcel",
			"1985",
			"Mels",
			"2:51.43,5"
		],
		[
			"42-Wom",
			"1558",
			"Rindlisbacher Esther",
			"1965",
			"Abtwil",
			"3:19.53,9"
		],
		[
			"42-Men",
			"7815",
			"Rindlisbacher Manfred",
			"1958",
			"Abtwil",
			"3:56.04,4"
		],
		[
			"42-Wom",
			"561",
			"Risch Claudia",
			"1978",
			"Lichtensteig",
			"2:31.23,6"
		],
		[
			"42-Men",
			"1105",
			"Ritter Heinz",
			"1970",
			"Altstätten",
			"1:50.17,7"
		],
		[
			"42-Men",
			"7727",
			"Rohner Markus",
			"1963",
			"St.Gallen",
			"3:52.10,0"
		],
		[
			"42-Men",
			"1290",
			"Rohner Roman",
			"1987",
			"Neu St.Johann",
			"1:52.22,4"
		],
		[
			"21-Wom",
			"634",
			"Rohner Sandra",
			"1989",
			"St.Gallen",
			"2:00.17,8"
		],
		[
			"42-Wom",
			"1639",
			"Rohner Selina",
			"1996",
			"Grabs",
			"3:23.41,6"
		],
		[
			"42-Men",
			"6850",
			"Roelli Jonas",
			"1992",
			"St.Gallen",
			"3:21.56,7"
		],
		[
			"42-Wom",
			"2291",
			"Romer Daniela",
			"1971",
			"Bad Ragaz",
			"4:13.14,2"
		],
		[
			"42-Men",
			"455",
			"Romer David",
			"1978",
			"Mols",
			"1:41.53,4"
		],
		[
			"42-Wom",
			"1220",
			"Romer-Ramseier Melanie",
			"1981",
			"Mols",
			"3:05.04,7"
		],
		[
			"42-Men",
			"8055",
			"Romer Thomas",
			"1971",
			"Bad Ragaz",
			"4:13.13,6"
		],
		[
			"42-Men",
			"7901",
			"Romer Thomas",
			"1983",
			"Engelburg",
			"4:01.07,8"
		],
		[
			"42-Men",
			"7973",
			"Rominger Lukas",
			"1990",
			"Jona",
			"4:06.32,2"
		],
		[
			"42-Men",
			"5231",
			"Rönnfeld Stefan",
			"1965",
			"St.Gallen",
			"2:50.33,8"
		],
		[
			"21-Wom",
			"673",
			"Roost Tanja",
			"1977",
			"Kirchberg",
			"2:04.01,9"
		],
		[
			"42-Men",
			"4428",
			"Roost Thomas",
			"1972",
			"Kirchberg",
			"2:36.57,4"
		],
		[
			"42-Men",
			"2450",
			"Roth Fritz",
			"1970",
			"Lütisburg",
			"2:08.11,3"
		],
		[
			"42-Men",
			"5421",
			"Rüdisühli Fabian",
			"1998",
			"Berneck",
			"2:53.46,4"
		],
		[
			"42-Men",
			"6250",
			"Rüdisühli Kurt",
			"1970",
			"Balgach",
			"3:08.04,2"
		],
		[
			"42-Men",
			"3816",
			"Rüegg Albert",
			"1955",
			"Ricken",
			"2:28.05,7"
		],
		[
			"42-Wom",
			"407",
			"Rüegg Cornelia",
			"1987",
			"Ricken",
			"2:21.01,6"
		],
		[
			"42-Men",
			"769",
			"Rüegg Manuel",
			"1993",
			"Ricken",
			"1:46.06,2"
		],
		[
			"42-Men",
			"4706",
			"Rüegg Michael",
			"1990",
			"St.Gallenkappel",
			"2:41.29,3"
		],
		[
			"42-Men",
			"7009",
			"Rüegg Raimund",
			"1964",
			"Bad Ragaz",
			"3:26.02,1"
		],
		[
			"42-Men",
			"3591",
			"Rüegg Walter",
			"1955",
			"Ricken",
			"2:24.51,3"
		],
		[
			"42-Men",
			"5505",
			"Rupp Adrian",
			"1967",
			"Valens",
			"2:55.19,6"
		],
		[
			"42-Wom",
			"336",
			"Rupp Angela",
			"1984",
			"St.Gallen",
			"2:14.57,3"
		],
		[
			"21-Men",
			"769",
			"Rupper Florin",
			"1949",
			"Rorschacherberg",
			"1:59.18,1"
		],
		[
			"42-Men",
			"4347",
			"Rusch Bert",
			"1949",
			"Degersheim",
			"2:35.49,0"
		],
		[
			"42-Men",
			"235",
			"Rüthemann Martin",
			"1979",
			"Eschenbach",
			"1:36.36,1"
		],
		[
			"42-Men",
			"6404",
			"Rütsche Niklaus",
			"1960",
			"St.Gallen",
			"3:10.41,5"
		],
		[
			"42-Men",
			"3240",
			"Rütsche Ralph",
			"1979",
			"Lütisburg",
			"2:19.46,2"
		],
		[
			"42-Men",
			"358",
			"Rüttimann Marco",
			"1971",
			"Goldach",
			"1:39.48,2"
		],
		[
			"42-Men",
			"2215",
			"Saks Tauno",
			"1970",
			"Diepoldsau",
			"2:04.40,8"
		],
		[
			"42-Men",
			"3059",
			"Sammet Marius",
			"1977",
			"St.Gallen",
			"2:16.44,5"
		],
		[
			"42-Men",
			"4023",
			"Sator Dieter",
			"1968",
			"Altstätten",
			"2:31.28,2"
		],
		[
			"42-Men",
			"2998",
			"Sauter Heinz",
			"1959",
			"St.Gallen",
			"2:15.55,4"
		],
		[
			"42-Wom",
			"1517",
			"Schälle Anina",
			"1989",
			"St.Gallen",
			"3:18.00,3"
		],
		[
			"42-Men",
			"3963",
			"Schälle Marcel",
			"1956",
			"St.Gallen",
			"2:30.26,1"
		],
		[
			"42-Men",
			"1006",
			"Schäpper Martin",
			"1969",
			"Lichtensteig",
			"1:49.17,4"
		],
		[
			"42-Men",
			"2334",
			"Scherrer Adrian",
			"1970",
			"Flawil",
			"2:06.20,4"
		],
		[
			"42-Men",
			"4416",
			"Scherrer Roman",
			"1976",
			"Bütschwil",
			"2:36.47,8"
		],
		[
			"42-Men",
			"4696",
			"Scherzinger Fredy",
			"1955",
			"Schmerikon",
			"2:41.19,3"
		],
		[
			"42-Men",
			"8038",
			"Schick Elmar",
			"1965",
			"Marbach",
			"4:11.25,0"
		],
		[
			"42-Men",
			"1571",
			"Schieler Ronny",
			"1979",
			"Flums",
			"1:55.15,9"
		],
		[
			"42-Men",
			"2714",
			"Schiess Christian",
			"1972",
			"Andwil",
			"2:11.47,4"
		],
		[
			"42-Men",
			"6852",
			"Schlegel André",
			"1984",
			"Wangs",
			"3:22.01,3"
		],
		[
			"42-Men",
			"3027",
			"Schlegel Manuel",
			"1986",
			"Mels",
			"2:16.20,1"
		],
		[
			"21-Men",
			"940",
			"Schlegel Markus",
			"1982",
			"Weite",
			"2:27.56,5"
		],
		[
			"21-Men",
			"692",
			"Schlumpf Norbert",
			"1949",
			"Ebnat-Kappel",
			"1:52.33,7"
		],
		[
			"42-Wom",
			"1425",
			"Schmid Brigitte",
			"1970",
			"Walenstadt",
			"3:13.43,4"
		],
		[
			"42-Wom",
			"1764",
			"Schmid Patrizia",
			"1998",
			"Vilters",
			"3:29.56,5"
		],
		[
			"21-Men",
			"942",
			"Schmid Paul",
			"1934",
			"Goldach",
			"2:28.12,4"
		],
		[
			"42-Men",
			"1200",
			"Schmid Stefan",
			"1978",
			"St.Gallen",
			"1:51.20,1"
		],
		[
			"42-Men",
			"4334",
			"Schmid Thomas",
			"1968",
			"Walenstadt",
			"2:35.37,3"
		],
		[
			"42-Men",
			"3368",
			"Schnecko Moritz",
			"1969",
			"Rapperswil",
			"2:21.32,8"
		],
		[
			"42-Men",
			"6421",
			"Schneeberger Moritz",
			"1987",
			"St.Gallen",
			"3:11.11,7"
		],
		[
			"21-Wom",
			"302",
			"Schneider-Juchli Veren",
			"1965",
			"Uzwil",
			"1:38.00,1"
		],
		[
			"42-Men",
			"6410",
			"Schneider Mario",
			"1985",
			"Tscherlach",
			"3:10.46,2"
		],
		[
			"42-Men",
			"1053",
			"Schneider Peter",
			"1966",
			"Uzwil",
			"1:49.47,0"
		],
		[
			"42-Men",
			"3332",
			"Schneider Pirmin",
			"1984",
			"Wil",
			"2:21.04,5"
		],
		[
			"42-Men",
			"4051",
			"Schneider Samuel",
			"1985",
			"Abtwil",
			"2:31.54,7"
		],
		[
			"42-Men",
			"4338",
			"Schnyder Philippe",
			"1978",
			"Flawil",
			"2:35.40,6"
		],
		[
			"21-Wom",
			"535",
			"Schrepfer Ilona Marie",
			"1995",
			"Amden",
			"1:52.23,4"
		],
		[
			"42-Men",
			"8290",
			"Schumacher Arne",
			"1972",
			"Wangs",
			"4:57.53,8"
		],
		[
			"42-Wom",
			"1258",
			"Schwaninger Ruth",
			"1963",
			"St.Gallen",
			"3:07.08,2"
		],
		[
			"42-Men",
			"4301",
			"Schwendimann Reto",
			"1966",
			"Jona",
			"2:35.14,0"
		],
		[
			"42-Men",
			"3583",
			"Schwenzig Fabian",
			"1988",
			"Gams",
			"2:24.45,5"
		],
		[
			"42-Men",
			"3349",
			"Schwitter Willi",
			"1960",
			"Schänis",
			"2:21.16,5"
		],
		[
			"21-Men",
			"450",
			"Schwizer Beat",
			"1961",
			"Jona",
			"1:36.04,1"
		],
		[
			"42-Men",
			"4115",
			"Schwyter Beat",
			"1978",
			"Uznach",
			"2:32.47,9"
		],
		[
			"42-Men",
			"3058",
			"Seiler Rico",
			"1959",
			"Jona",
			"2:16.42,5"
		],
		[
			"21-Men",
			"625",
			"Seitz Denis",
			"1956",
			"St.Gallen",
			"1:47.10,3"
		],
		[
			"21-Men",
			"812",
			"Seiz Ralf",
			"1974",
			"Rapperswil",
			"2:02.41,9"
		],
		[
			"21-Men",
			"487",
			"Senn Dominik",
			"1995",
			"St.Gallen",
			"1:38.35,1"
		],
		[
			"21-Wom",
			"659",
			"Sidenko Elena",
			"1985",
			"Moscow",
			"2:02.17,4"
		],
		[
			"42-Men",
			"930",
			"Sieber Patrick",
			"1982",
			"Balgach",
			"1:48.20,6"
		],
		[
			"42-Men",
			"6818",
			"Sigrist Simon",
			"1996",
			"Schmerikon",
			"3:20.54,4"
		],
		[
			"42-Men",
			"7934",
			"Sikkema Louis",
			"2001",
			"Wattwil",
			"4:03.45,0"
		],
		[
			"21-Wom",
			"786",
			"Simon Linda",
			"1993",
			"St.Gallen",
			"2:21.47,0"
		],
		[
			"42-Men",
			"4078",
			"Simon Marcel",
			"1967",
			"Wolfertswil",
			"2:32.16,8"
		],
		[
			"42-Men",
			"5544",
			"Sonderegger Roman",
			"1976",
			"St.Gallen",
			"2:56.09,3"
		],
		[
			"42-Men",
			"2580",
			"Sprecher Christoph",
			"1981",
			"Sargans",
			"2:10.00,4"
		],
		[
			"42-Men",
			"3071",
			"Sprecher Fridolin",
			"1985",
			"Mels",
			"2:16.58,8"
		],
		[
			"42-Wom",
			"868",
			"Sprecher Rahel",
			"1996",
			"Vättis",
			"2:48.24,7"
		],
		[
			"21-Wom",
			"25",
			"Sprecher Stefanie",
			"1991",
			"Sargans",
			"1:02.02,2"
		],
		[
			"21-Wom",
			"538",
			"Stach Sheila",
			"1998",
			"St.Gallen",
			"1:52.35,1"
		],
		[
			"42-Men",
			"6590",
			"Stacher Reto",
			"1985",
			"St.Gallen",
			"3:14.57,9"
		],
		[
			"42-Men",
			"6760",
			"Stacher Robin",
			"1987",
			"St.Gallen",
			"3:19.25,9"
		],
		[
			"42-Men",
			"7997",
			"Stadelmann Thomas",
			"1975",
			"St.Gallen",
			"4:08.33,4"
		],
		[
			"42-Men",
			"3397",
			"Städler Ernst",
			"1952",
			"Wattwil",
			"2:22.07,5"
		],
		[
			"42-Men",
			"1465",
			"Stadler Guido",
			"1972",
			"Altstätten",
			"1:54.07,6"
		],
		[
			"42-Men",
			"1815",
			"Städler Simon",
			"1983",
			"St.Gallen",
			"1:58.37,8"
		],
		[
			"42-Men",
			"2123",
			"Stäheli Hans-Peter",
			"1961",
			"Ebnat-Kappel",
			"2:03.18,2"
		],
		[
			"21-Wom",
			"734",
			"Stäheli Michèle",
			"1994",
			"St.Gallen",
			"2:12.52,8"
		],
		[
			"42-Men",
			"6382",
			"Stähli Patrick",
			"1985",
			"Heiligkreuz (Mels)",
			"3:10.19,0"
		],
		[
			"42-Men",
			"1254",
			"Stambach Christian",
			"1970",
			"Thal",
			"1:51.58,3"
		],
		[
			"42-Men",
			"3736",
			"Stanossek Yves",
			"1991",
			"St.Gallen",
			"2:27.02,3"
		],
		[
			"21-Wom",
			"464",
			"Staub Manuela",
			"1989",
			"St.Gallen",
			"1:48.11,3"
		],
		[
			"42-Men",
			"3991",
			"Steiger Andy",
			"1967",
			"Andwil",
			"2:30.57,0"
		],
		[
			"42-Men",
			"3263",
			"Steiger Bruno",
			"1965",
			"Wil",
			"2:20.06,1"
		],
		[
			"42-Men",
			"1533",
			"Steiger Hanspeter",
			"1983",
			"Eichberg",
			"1:54.50,7"
		],
		[
			"42-Wom",
			"282",
			"Steiger-Kuratli Maria",
			"1988",
			"Eichberg",
			"2:10.02,5"
		],
		[
			"42-Wom",
			"66",
			"Steinbacher Barbara",
			"1986",
			"Bad Ragaz",
			"1:47.38,6"
		],
		[
			"42-Men",
			"782",
			"Steinbacher Manfred",
			"1988",
			"Bad Ragaz",
			"1:46.13,6"
		],
		[
			"42-Wom",
			"162",
			"Steiner Cecilia",
			"1971",
			"Maseltrangen",
			"1:58.33,5"
		],
		[
			"42-Men",
			"205",
			"Steiner Fadri",
			"1984",
			"Ebnat-Kappel",
			"1:35.13,7"
		],
		[
			"42-Men",
			"2217",
			"Steiner Samuel",
			"1987",
			"St.Gallen",
			"2:04.42,6"
		],
		[
			"42-Men",
			"1221",
			"Steiner Thomas",
			"1969",
			"Maseltrangen",
			"1:51.33,0"
		],
		[
			"42-Men",
			"1994",
			"Steiner Urs",
			"1966",
			"St.Gallen",
			"2:01.18,1"
		],
		[
			"42-Men",
			"8221",
			"Steingruber Dominik",
			"1990",
			"St.Gallen",
			"4:39.37,5"
		],
		[
			"42-Men",
			"6843",
			"Steinmann Urs",
			"1962",
			"Wildhaus",
			"3:21.40,7"
		],
		[
			"42-Wom",
			"134",
			"Stieger Nadja",
			"1972",
			"Hinterforst",
			"1:55.08,7"
		],
		[
			"42-Men",
			"3703",
			"Stoll Patrick",
			"1974",
			"Degersheim",
			"2:26.33,9"
		],
		[
			"42-Men",
			"7891",
			"Stössel Philipp",
			"1986",
			"Weesen",
			"4:00.30,1"
		],
		[
			"42-Wom",
			"2217",
			"Strahm Noemi",
			"1994",
			"Jona",
			"4:03.17,2"
		],
		[
			"21-Men",
			"438",
			"Strahm Pascal",
			"1996",
			"Jona",
			"1:35.37,9"
		],
		[
			"42-Men",
			"3965",
			"Strässle Philipp",
			"1976",
			"Jona",
			"2:30.27,1"
		],
		[
			"42-Men",
			"7403",
			"Streule Josef",
			"1946",
			"Goldach",
			"3:38.35,5"
		],
		[
			"42-Men",
			"784",
			"Streule Ralf",
			"1976",
			"Goldach",
			"1:46.15,4"
		],
		[
			"42-Men",
			"1981",
			"Stricker Andreas",
			"1963",
			"Azmoos",
			"2:01.10,1"
		],
		[
			"42-Wom",
			"1586",
			"Stricker Marina",
			"1990",
			"Grabs",
			"3:21.09,2"
		],
		[
			"21-Men",
			"901",
			"Strickler Hansjakob",
			"1941",
			"Schmerikon",
			"2:17.00,5"
		],
		[
			"21-Wom",
			"233",
			"Studer Gina",
			"1995",
			"Jona",
			"1:33.50,1"
		],
		[
			"42-Men",
			"1488",
			"Sturzenegger Beat",
			"1986",
			"Balgach",
			"1:54.23,2"
		],
		[
			"42-Wom",
			"1061",
			"Sturzenegger-Brack Sab",
			"1974",
			"Gossau",
			"2:58.18,1"
		],
		[
			"42-Men",
			"2973",
			"Sturzenegger Nico",
			"1974",
			"Gossau",
			"2:15.30,4"
		],
		[
			"42-Men",
			"3190",
			"Sturzenegger Patrick",
			"1983",
			"St.Gallen",
			"2:19.00,5"
		],
		[
			"42-Men",
			"7620",
			"Sturzenegger Urs",
			"1961",
			"Gossau",
			"3:47.22,5"
		],
		[
			"42-Men",
			"8321",
			"Suter Bruno",
			"1962",
			"Jona",
			"5:14.06,1"
		],
		[
			"21-Wom",
			"99",
			"Sutter Silvia",
			"1981",
			"St.Gallen",
			"1:22.09,7"
		],
		[
			"21-Wom",
			"465",
			"Sutter Tabea",
			"1991",
			"St.Gallen",
			"1:48.13,1"
		],
		[
			"42-Men",
			"8108",
			"Sylvester Dirk",
			"1969",
			"Bad Ragaz",
			"4:17.33,7"
		],
		[
			"42-Men",
			"7014",
			"Tanasoontrarat Manuel",
			"1989",
			"St.Gallen",
			"3:26.16,6"
		],
		[
			"42-Men",
			"7267",
			"Tanner Daniel",
			"1983",
			"St.Gallen",
			"3:33.32,8"
		],
		[
			"42-Men",
			"5269",
			"Tanner Remo",
			"1972",
			"Altstätten",
			"2:51.14,9"
		],
		[
			"42-Men",
			"3771",
			"Tappeiner Stephan",
			"1970",
			"Züberwangen",
			"2:27.35,6"
		],
		[
			"42-Men",
			"8282",
			"Tarnutzer René",
			"1962",
			"Wangs",
			"4:57.37,5"
		],
		[
			"21-Men",
			"890",
			"Tedesco Dominic",
			"1971",
			"Heerbrugg",
			"2:15.19,8"
		],
		[
			"42-Wom",
			"2037",
			"Tedesco Isabel",
			"1976",
			"Heerbrugg",
			"3:47.44,6"
		],
		[
			"42-Men",
			"2886",
			"Thalmann Urs",
			"1966",
			"Ulisbach",
			"2:14.08,4"
		],
		[
			"42-Men",
			"7115",
			"Theiler Roger",
			"1980",
			"Schänis",
			"3:28.35,8"
		],
		[
			"42-Men",
			"4913",
			"Thoma Werner",
			"1955",
			"Amden",
			"2:44.39,9"
		],
		[
			"42-Men",
			"2929",
			"Thomann Martin",
			"1984",
			"Jonschwil",
			"2:14.51,5"
		],
		[
			"42-Men",
			"3270",
			"Thürlemann Norbert",
			"1968",
			"Schwarzenbach",
			"2:20.13,7"
		],
		[
			"21-Wom",
			"725",
			"Thurnhofer Tanja",
			"1974",
			"Jona",
			"2:11.46,8"
		],
		[
			"21-Wom",
			"868",
			"Tigges Häne Barbara",
			"1957",
			"Flawil",
			"2:46.12,1"
		],
		[
			"42-Wom",
			"1292",
			"Tiri Sidonia",
			"1980",
			"Wil",
			"3:08.28,4"
		],
		[
			"42-Men",
			"6435",
			"Tobler Manfred",
			"1978",
			"St.Gallen",
			"3:11.35,0"
		],
		[
			"21-Wom",
			"129",
			"Tomaschett Cecile",
			"1982",
			"Kaltbrunn",
			"1:25.24,0"
		],
		[
			"21-Men",
			"1013",
			"Trenti Gianpietro",
			"1961",
			"Rorschach",
			"2:50.47,3"
		],
		[
			"42-Wom",
			"752",
			"Truniger Annina",
			"1981",
			"St.Gallen",
			"2:41.49,9"
		],
		[
			"42-Men",
			"776",
			"Truniger Samuel",
			"1983",
			"St.Gallen",
			"1:46.07,4"
		],
		[
			"42-Men",
			"1911",
			"Tschirky Felix",
			"1966",
			"Lütisburg",
			"2:00.06,5"
		],
		[
			"42-Men",
			"582",
			"Tschirky Roger",
			"1982",
			"Mels",
			"1:43.23,5"
		],
		[
			"42-Wom",
			"1972",
			"Tschumper Andrea",
			"1974",
			"Degersheim",
			"3:43.19,7"
		],
		[
			"42-Men",
			"4864",
			"Tschumper Christian",
			"1970",
			"Degersheim",
			"2:43.58,5"
		],
		[
			"42-Men",
			"7442",
			"Ulber Davio",
			"1988",
			"Eichberg",
			"3:40.07,5"
		],
		[
			"42-Men",
			"8031",
			"Vandersmissen Eduard",
			"1962",
			"Uetliburg",
			"4:11.04,4"
		],
		[
			"42-Wom",
			"1746",
			"Vandewall Maartje",
			"1979",
			"Flums",
			"3:29.09,4"
		],
		[
			"42-Men",
			"1786",
			"Venzin Fabian",
			"1990",
			"Diepoldsau",
			"1:58.09,2"
		],
		[
			"42-Men",
			"4560",
			"Verch Karsten",
			"1983",
			"Rapperswil",
			"2:38.58,9"
		],
		[
			"21-Men",
			"946",
			"Vestner Paul",
			"1953",
			"Wattwil",
			"2:29.13,7"
		],
		[
			"42-Men",
			"2964",
			"Vetsch Andri",
			"1996",
			"Eggersriet",
			"2:15.19,2"
		],
		[
			"42-Men",
			"2040",
			"Vetsch Christian",
			"1975",
			"Ebnat-Kappel",
			"2:02.13,1"
		],
		[
			"21-Men",
			"58",
			"Vetsch Dario",
			"2003",
			"Ebnat-Kappel",
			"59.32.5"
		],
		[
			"42-Men",
			"2249",
			"Vetsch Ruedi",
			"1967",
			"Eggersriet",
			"2:05.11,3"
		],
		[
			"21-Men",
			"451",
			"Vetsch Stephan",
			"1945",
			"Ebnat-Kappel",
			"1:36.06,7"
		],
		[
			"42-Men",
			"5284",
			"Vetsch Thomas",
			"1988",
			"Sargans",
			"2:51.27,6"
		],
		[
			"42-Men",
			"6102",
			"Vettiger Roland",
			"1971",
			"Schwarzenbach",
			"3:05.09,1"
		],
		[
			"42-Men",
			"410",
			"Vidotto Patrik",
			"1975",
			"Mels",
			"1:41.05,7"
		],
		[
			"42-Men",
			"4728",
			"Viecelli Sandro",
			"1987",
			"Trübbach",
			"2:41.49,4"
		],
		[
			"42-Men",
			"436",
			"Vogel Arthur",
			"1969",
			"Dietfurt",
			"1:41.32,1"
		],
		[
			"42-Men",
			"7757",
			"Vogel Matthias",
			"1976",
			"Wil",
			"3:53.30,5"
		],
		[
			"42-Men",
			"7682",
			"Vogel Patrick",
			"1987",
			"St.Gallen",
			"3:50.08,9"
		],
		[
			"21-Wom",
			"897",
			"Vogel Priska",
			"1989",
			"Sargans",
			"3:11.02,4"
		],
		[
			"42-Men",
			"3640",
			"Vögelin Marius",
			"1988",
			"St.Gallen",
			"2:25.32,2"
		],
		[
			"42-Men",
			"5166",
			"Vogler Christen Patric",
			"1974",
			"Thal",
			"2:49.12,2"
		],
		[
			"42-Men",
			"5711",
			"Vogler Daniel",
			"1981",
			"Wangs",
			"2:58.29,2"
		],
		[
			"21-Men",
			"659",
			"Volden Matthias",
			"1986",
			"St.Gallen",
			"1:50.00,1"
		],
		[
			"42-Men",
			"4678",
			"Vollenweider Frank",
			"1973",
			"St.Gallen",
			"2:41.03,6"
		],
		[
			"42-Men",
			"6297",
			"von Grüningen Ernst",
			"1947",
			"Oberterzen",
			"3:08.44,5"
		],
		[
			"42-Men",
			"6723",
			"von Gunten Philippe",
			"1984",
			"Steinach",
			"3:18.12,8"
		],
		[
			"42-Wom",
			"710",
			"von Schulthess Katja",
			"1992",
			"St.Gallen",
			"2:39.29,2"
		],
		[
			"42-Men",
			"4134",
			"von Schulthess Tobias",
			"1960",
			"St.Gallen",
			"2:33.07,9"
		],
		[
			"42-Men",
			"1577",
			"Wächter Martin",
			"1985",
			"St.Gallen",
			"1:55.20,5"
		],
		[
			"21-Men",
			"132",
			"Wachter Patrick",
			"1979",
			"Mels",
			"1:11.43,7"
		],
		[
			"42-Men",
			"4068",
			"Wagner Walter",
			"1965",
			"St.Gallen",
			"2:32.10,5"
		],
		[
			"42-Men",
			"6078",
			"Walder Ivo",
			"1994",
			"Mosnang",
			"3:04.32,9"
		],
		[
			"42-Men",
			"7035",
			"Walser Roger",
			"1971",
			"Unterterzen",
			"3:26.48,0"
		],
		[
			"42-Men",
			"7100",
			"Wälti Roland",
			"1958",
			"Mels",
			"3:28.19,3"
		],
		[
			"42-Wom",
			"1185",
			"Weber Alice",
			"1966",
			"Andwil",
			"3:03.18,4"
		],
		[
			"42-Men",
			"7773",
			"Weber Gabriel",
			"1968",
			"Jona",
			"3:54.04,4"
		],
		[
			"42-Men",
			"4608",
			"Weber Ivo",
			"1965",
			"Andwil",
			"2:39.47,6"
		],
		[
			"42-Wom",
			"1133",
			"Weber Ramona",
			"1990",
			"St.Gallen",
			"3:01.28,1"
		],
		[
			"42-Wom",
			"691",
			"Weber Sabrina",
			"1988",
			"Gossau",
			"2:38.38,5"
		],
		[
			"42-Men",
			"3614",
			"Wenk Bartholomäus",
			"1982",
			"Wildhaus",
			"2:25.07,8"
		],
		[
			"42-Men",
			"5142",
			"Wepfer Roland",
			"1963",
			"Zuckenriet",
			"2:48.39,9"
		],
		[
			"42-Men",
			"678",
			"Westermann Peter",
			"1972",
			"Ulisbach",
			"1:44.46,3"
		],
		[
			"42-Wom",
			"88",
			"Wetli Joy",
			"1992",
			"Walenstadt",
			"1:50.34,2"
		],
		[
			"42-Men",
			"5481",
			"Wetzig Volker",
			"1961",
			"Walenstadt",
			"2:54.50,3"
		],
		[
			"21-Wom",
			"70",
			"Weyermann Nathalie",
			"1994",
			"Thal",
			"1:19.01,2"
		],
		[
			"42-Wom",
			"1566",
			"Wick Jana",
			"1995",
			"St.Gallen",
			"3:20.15,6"
		],
		[
			"42-Men",
			"7756",
			"Wickli Jakob",
			"1942",
			"Krinau",
			"3:53.27,3"
		],
		[
			"42-Men",
			"1791",
			"Wickli Jakob Andreas",
			"1976",
			"Krinau",
			"1:58.14,1"
		],
		[
			"42-Men",
			"4759",
			"Widmer Andreas",
			"1960",
			"Mühlrüti",
			"2:42.16,6"
		],
		[
			"42-Men",
			"1842",
			"Widmer Christoph",
			"1965",
			"Kirchberg",
			"1:59.09,2"
		],
		[
			"42-Wom",
			"297",
			"Widmer Désiré",
			"1993",
			"Kirchberg",
			"2:11.32,7"
		],
		[
			"42-Men",
			"7089",
			"Widmer Dominik",
			"1984",
			"Vilters",
			"3:28.09,2"
		],
		[
			"42-Wom",
			"92",
			"Widmer Valerie",
			"1997",
			"Kirchberg",
			"1:50.45,1"
		],
		[
			"42-Men",
			"4198",
			"Wiederkehr Chris",
			"1973",
			"Eschenbach",
			"2:33.53,9"
		],
		[
			"42-Wom",
			"487",
			"Wiederkehr Evelyne",
			"1978",
			"Eschenbach",
			"2:26.17,0"
		],
		[
			"42-Men",
			"2381",
			"Wieland Martin",
			"1963",
			"Bad Ragaz",
			"2:07.01,4"
		],
		[
			"42-Wom",
			"2273",
			"Wild Cornelia",
			"1978",
			"Muolen",
			"4:10.18,5"
		],
		[
			"42-Men",
			"3279",
			"Wildhaber Daniel",
			"1970",
			"Walenstadt",
			"2:20.20,2"
		],
		[
			"42-Wom",
			"1942",
			"Wilhelm Fiona",
			"1989",
			"St.Gallen",
			"3:40.36,5"
		],
		[
			"21-Wom",
			"876",
			"Willi Yvonne",
			"1965",
			"Weesen",
			"2:50.46,7"
		],
		[
			"42-Men",
			"5845",
			"Windmüller Jan",
			"1998",
			"Sargans",
			"3:00.38,5"
		],
		[
			"21-Wom",
			"97",
			"Windmüller Sabrina",
			"1987",
			"Sargans",
			"1:21.52,3"
		],
		[
			"42-Wom",
			"1653",
			"Windmüller Tina",
			"1958",
			"Sargans",
			"3:24.26,6"
		],
		[
			"42-Men",
			"6305",
			"Winkelmann Marc",
			"1983",
			"Wil",
			"3:08.55,5"
		],
		[
			"42-Men",
			"5119",
			"Winter Claudio",
			"1990",
			"Diepoldsau",
			"2:48.14,9"
		],
		[
			"21-Wom",
			"781",
			"Wipf Margret",
			"1938",
			"Wil",
			"2:20.49,4"
		],
		[
			"21-Men",
			"993",
			"Wirth Anton",
			"1966",
			"Uznach",
			"2:45.33,9"
		],
		[
			"42-Men",
			"6591",
			"Wirz Josef",
			"1957",
			"Uznach",
			"3:14.59,2"
		],
		[
			"42-Men",
			"7900",
			"Wohlwend Lukas",
			"1961",
			"Staad",
			"4:01.06,6"
		],
		[
			"42-Wom",
			"413",
			"Wüst Denise",
			"1984",
			"St.Gallen",
			"2:21.29,7"
		],
		[
			"42-Men",
			"8380",
			"Wüst Johann",
			"1955",
			"Montlingen",
			"1:58.07,5"
		],
		[
			"42-Men",
			"7206",
			"Wyler Marco",
			"1976",
			"Rapperswil",
			"3:31.25,9"
		],
		[
			"42-Wom",
			"2422",
			"Zäch Tarnutzer Yvonne",
			"1962",
			"Wangs",
			"4:57.48,8"
		],
		[
			"42-Men",
			"5923",
			"Zahner Reto",
			"1967",
			"Eschenbach",
			"3:01.56,0"
		],
		[
			"42-Men",
			"3759",
			"Zahner Willi",
			"1977",
			"Kaltbrunn",
			"2:27.23,7"
		],
		[
			"21-Wom",
			"627",
			"Zanolari Patrizia",
			"1994",
			"Rapperswil",
			"1:59.35,3"
		],
		[
			"42-Men",
			"3108",
			"Zehnder Thomas",
			"1965",
			"Wil",
			"2:17.32,5"
		],
		[
			"42-Men",
			"4183",
			"Zellweger Lorenz",
			"1957",
			"Benken",
			"2:33.41,8"
		],
		[
			"42-Men",
			"5279",
			"Zellweger Marc",
			"1990",
			"St.Gallen",
			"2:51.24,5"
		],
		[
			"42-Men",
			"7395",
			"Zellweger Stefan",
			"1990",
			"St.Gallen",
			"3:38.21,8"
		],
		[
			"42-Wom",
			"309",
			"Ziegler Salome",
			"1989",
			"Rapperswil",
			"2:13.00,0"
		],
		[
			"42-Men",
			"3452",
			"Zimmermann Daniel",
			"1976",
			"Tübach",
			"2:22.54,8"
		],
		[
			"42-Wom",
			"1353",
			"Zimmermann Ivana",
			"1974",
			"Wangs",
			"3:10.47,7"
		],
		[
			"42-Men",
			"5703",
			"Zimmermann Iwan",
			"1978",
			"Wangs",
			"2:58.22,1"
		],
		[
			"42-Wom",
			"1393",
			"Züllig Astrid",
			"1976",
			"St.Gallen",
			"3:12.28,8"
		],
		[
			"42-Men",
			"8033",
			"Zünd Claude",
			"1971",
			"Marbach",
			"4:11.08,7"
		],
		[
			"42-Men",
			"2210",
			"Zünd René",
			"1969",
			"Altstätten",
			"2:04.34,5"
		],
		[
			"21-Men",
			"711",
			"Zürcher Hanspeter",
			"1970",
			"Oberuzwil",
			"1:53.43,1"
		],
		[
			"21-Wom",
			"835",
			"Zürcher-Huber Susanne",
			"1971",
			"Oberuzwil",
			"2:34.37,6"
		],
		[
			"42-Men",
			"7592",
			"Zürcher Tobias",
			"1989",
			"St.Gallen",
			"3:45.44,6"
		],
		[
			"42-Men",
			"2525",
			"Zwahlen Sebastian",
			"1991",
			"Goldach",
			"2:09.11,6"
		],
		[
			"21-Men",
			"959",
			"Zwinggi Robert",
			"1932",
			"Gossau",
			"2:32.56,2"
		]
	],
	metaData: {
		cells: [
			{
				data: {
				},
				rowIndex: 7,
				colIndex: 2
			}
		]
	}
};
var sources$g = [
	{
		link: {
		},
		text: "datasport.com / tn"
	}
];
var options$g = {
	hideTableHeader: false,
	cardLayout: false,
	cardLayoutIfSmall: false,
	minibar: {
		invertColors: false,
		barColor: {
			positive: {
				className: "",
				colorCode: ""
			},
			negative: {
				className: "",
				colorCode: ""
			}
		},
		selectedColumn: null
	}
};
var subtitle$7 = "Bugreport here: https://github.com/nzzdev/Q-table/issues/88";
var lotsOfData = {
	title: title$h,
	data: data$g,
	sources: sources$g,
	options: options$g,
	subtitle: subtitle$7
};

var data$f = {
	table: [
		[
			null,
			"Resultat",
			"xGoals",
			null
		],
		[
			"Russland - Saudiarabien",
			"5:0",
			"1,8 : 0,2",
			null
		],
		[
			"Südkorea - Deutschland",
			"2:0",
			"1,3 : 2,7",
			"↻"
		],
		[
			"England - Panama",
			"6:1",
			"2,8 : 1,1",
			null
		],
		[
			"Australien - Peru",
			"0:2",
			"1,0 : 0,2",
			"↻"
		],
		[
			"Island - Kroatien",
			"1:2",
			"2,2 : 0,7",
			"↻"
		],
		[
			"Nigeria - Island",
			"2:0",
			"0,9 : 1,3",
			"↻"
		],
		[
			"Russland - Ägypten",
			"3:1",
			"1,2 : 1,4",
			"↻"
		]
	],
	metaData: {
		cells: [
		]
	}
};
var sources$f = [
];
var options$f = {
	hideTableHeader: false,
	cardLayout: false,
	cardLayoutIfSmall: false,
	minibar: {
		invertColors: false,
		barColor: {
			positive: {
				className: "",
				colorCode: ""
			},
			negative: {
				className: "",
				colorCode: ""
			}
		},
		selectedColumn: null
	}
};
var title$g = "FIXTURE: special characters";
var notes = "↻ = Das Spiel wäre anders ausgegangen, wenn beide Teams gleich viel aus ihren Chancen gemacht hätten.";
var subtitle$6 = "Spiele mit der grössten Abweichung zwischen erwartetem und effektivem Resultat";
var specialCharacters = {
	data: data$f,
	sources: sources$f,
	options: options$f,
	title: title$g,
	notes: notes,
	subtitle: subtitle$6
};

var title$f = "FIXTURE: four column numeric card layout for small";
var subtitle$5 = "Subtitle";
var data$e = {
	table: [
		[
			"Kennzahlen",
			"2016",
			"2017"
		],
		[
			"Umsatz",
			"12000",
			"10000"
		],
		[
			"Betriebsergebnis Ebit",
			"79123",
			"12333"
		],
		[
			"Ebit-Marge (%)",
			"12332",
			"32147"
		],
		[
			"Konzernergebnis",
			"12331",
			"10000"
		],
		[
			"Cashflow aus Geschäftstätigkeit",
			"99999",
			"12312"
		]
	],
	metaData: {
		cells: [
		]
	}
};
var sources$e = [
];
var options$e = {
	cardLayout: false,
	cardLayoutIfSmall: true,
	minibar: {
		invertColors: false,
		barColor: {
			positive: {
				className: "",
				colorCode: ""
			},
			negative: {
				className: "",
				colorCode: ""
			}
		},
		selectedColumn: null
	}
};
var formattedNumbers = {
	title: title$f,
	subtitle: subtitle$5,
	data: data$e,
	sources: sources$e,
	options: options$e
};

var title$e = "FIXTURE: four column numeric card layout for small mixed";
var subtitle$4 = "Subtitle";
var data$d = {
	table: [
		[
			"Kennzahlen",
			"2016",
			"2017"
		],
		[
			"Umsatz",
			"1200",
			"100"
		],
		[
			"Betriebsergebnis Ebit",
			"79123",
			"2000"
		],
		[
			"Ebit-Marge (%)",
			"12332",
			"300"
		],
		[
			"Konzernergebnis",
			"12331",
			"4000"
		],
		[
			"Cashflow aus Geschäftstätigkeit",
			"99999",
			"10000"
		]
	],
	metaData: {
		cells: [
		]
	}
};
var sources$d = [
];
var options$d = {
	cardLayout: false,
	cardLayoutIfSmall: true
};
var formattedNumbersMixed = {
	title: title$e,
	subtitle: subtitle$4,
	data: data$d,
	sources: sources$d,
	options: options$d
};

var title$d = "FIXTURE: four column numeric card layout for small negative";
var subtitle$3 = "Subtitle";
var data$c = {
	table: [
		[
			"Kennzahlen",
			"2016",
			"2017"
		],
		[
			"Umsatz",
			"12000",
			"-10000"
		],
		[
			"Betriebsergebnis Ebit",
			"79123",
			"12333"
		],
		[
			"Ebit-Marge (%)",
			"12332",
			"32147"
		],
		[
			"Konzernergebnis",
			"12331",
			"10000"
		],
		[
			"Cashflow aus Geschäftstätigkeit",
			"99999",
			"12312"
		]
	],
	metaData: {
		cells: [
		]
	}
};
var sources$c = [
];
var options$c = {
	cardLayout: false,
	cardLayoutIfSmall: true
};
var formattedNumbersNegative = {
	title: title$d,
	subtitle: subtitle$3,
	data: data$c,
	sources: sources$c,
	options: options$c
};

var title$c = "FIXTURE: table search hide";
var data$b = {
	table: [
		[
			"Country",
			"Number"
		],
		[
			"Somalia",
			"-0.1459"
		],
		[
			"Honduras",
			"0.2758"
		],
		[
			"Malawi",
			"-0.0534"
		],
		[
			"Comoros",
			"0.0111"
		],
		[
			"Greece",
			"-0.1775"
		],
		[
			"Turkmenistan",
			"0.0803"
		],
		[
			"Panama",
			"0.0164"
		],
		[
			"Austria",
			"-0.0462"
		],
		[
			"Saint Barthélemy",
			"-0.0247"
		],
		[
			"Kazakhstan",
			"-0.0067"
		],
		[
			"Azerbaijan",
			"0.044"
		],
		[
			"Netherlands",
			"0.2486"
		],
		[
			"Yemen",
			"-0.106"
		],
		[
			"Sint Maarten",
			"0.4218"
		],
		[
			"Svalbard and Jan Mayen Islands",
			"-0.1107"
		],
		[
			"Belarus",
			"-0.4466"
		],
		[
			"China",
			"-0.4345"
		],
		[
			"Congo (Brazzaville)",
			"-0.1386"
		],
		[
			"Belgium",
			"-0.0206"
		],
		[
			"Poland",
			"0.2016"
		]
	],
	metaData: {
		cells: [
		]
	}
};
var sources$b = [
	{
		link: {
		},
		text: "The Very Important Center For Very Important Data"
	}
];
var options$b = {
	hideTableHeader: false,
	showTableSearch: false,
	cardLayout: false,
	cardLayoutIfSmall: true,
	minibar: {
		invertColors: false,
		barColor: {
			positive: {
				className: "",
				colorCode: ""
			},
			negative: {
				className: "",
				colorCode: ""
			}
		},
		selectedColumn: null
	}
};
var tool$2 = "table";
var subtitle$2 = "Very important data country by country";
var tableSearchHidden = {
	title: title$c,
	data: data$b,
	sources: sources$b,
	options: options$b,
	tool: tool$2,
	subtitle: subtitle$2
};

var title$b = "FIXTURE: table search show";
var data$a = {
	table: [
		[
			"Country",
			"Number"
		],
		[
			"Somalia",
			"-0.1459"
		],
		[
			"Honduras",
			"0.2758"
		],
		[
			"Malawi",
			"-0.0534"
		],
		[
			"Comoros",
			"0.0111"
		],
		[
			"Greece",
			"-0.1775"
		],
		[
			"Turkmenistan",
			"0.0803"
		],
		[
			"Panama",
			"0.0164"
		],
		[
			"Austria",
			"-0.0462"
		],
		[
			"Saint Barthélemy",
			"-0.0247"
		],
		[
			"Kazakhstan",
			"-0.0067"
		],
		[
			"Azerbaijan",
			"0.044"
		],
		[
			"Netherlands",
			"0.2486"
		],
		[
			"Yemen",
			"-0.106"
		],
		[
			"Sint Maarten",
			"0.4218"
		],
		[
			"Svalbard and Jan Mayen Islands",
			"-0.1107"
		],
		[
			"Belarus",
			"-0.4466"
		],
		[
			"China",
			"-0.4345"
		],
		[
			"Congo (Brazzaville)",
			"-0.1386"
		],
		[
			"Belgium",
			"-0.0206"
		],
		[
			"Poland",
			"0.2016"
		]
	],
	metaData: {
		cells: [
		]
	}
};
var sources$a = [
	{
		link: {
		},
		text: "The Very Important Center For Very Important Data"
	}
];
var options$a = {
	hideTableHeader: false,
	showTableSearch: true,
	cardLayout: false,
	cardLayoutIfSmall: true,
	minibar: {
		invertColors: false,
		barColor: {
			positive: {
				className: "",
				colorCode: ""
			},
			negative: {
				className: "",
				colorCode: ""
			}
		},
		selectedColumn: null
	}
};
var tool$1 = "table";
var subtitle$1 = "Very important data country by country";
var tableSearchShow = {
	title: title$b,
	data: data$a,
	sources: sources$a,
	options: options$a,
	tool: tool$1,
	subtitle: subtitle$1
};

var title$a = "FIXTURE: table search with multiple columns";
var data$9 = {
	table: [
		[
			"Country 1",
			"Value 1",
			"Country 2",
			"Value 2"
		],
		[
			"Netherlands",
			"orange",
			"Netherlands",
			"green"
		],
		[
			"Austria",
			"red",
			"Netherlands",
			"yellow"
		],
		[
			"Italy",
			"red",
			"France",
			"red"
		],
		[
			"Netherlands",
			"yellow",
			"Spain",
			"orange"
		],
		[
			"Italy",
			"yellow",
			"Germany",
			"orange"
		],
		[
			"Italy",
			"orange",
			"Belgium",
			"yellow"
		],
		[
			"Poland",
			"green",
			"Poland",
			"orange"
		],
		[
			"Italy",
			"orange",
			"Germany",
			"red"
		],
		[
			"Belgium",
			"yellow",
			"Spain",
			"green"
		],
		[
			"Spain",
			"green",
			"Germany",
			"orange"
		],
		[
			"Poland",
			"red",
			"Poland",
			"green"
		],
		[
			"Italy",
			"yellow",
			"Poland",
			"orange"
		],
		[
			"Netherlands",
			"yellow",
			"Italy",
			"green"
		],
		[
			"Belgium",
			"green",
			"Belgium",
			"orange"
		],
		[
			"Germany",
			"yellow",
			"Spain",
			"orange"
		],
		[
			"France",
			"green",
			"Italy",
			"orange"
		],
		[
			"Poland",
			"green",
			"Poland",
			"orange"
		],
		[
			"Germany",
			"yellow",
			"Austria",
			"orange"
		],
		[
			"Italy",
			"orange",
			"Austria",
			"orange"
		],
		[
			"France",
			"orange",
			"Netherlands",
			"yellow"
		]
	],
	metaData: {
		cells: [
		]
	}
};
var sources$9 = [
	{
		link: {
		},
		text: "The Very Important Center For Very Important Data"
	}
];
var options$9 = {
	hideTableHeader: false,
	showTableSearch: true,
	cardLayout: false,
	cardLayoutIfSmall: true,
	minibar: {
		invertColors: false,
		barColor: {
			positive: {
				className: "",
				colorCode: ""
			},
			negative: {
				className: "",
				colorCode: ""
			}
		},
		selectedColumn: null
	}
};
var tool = "table";
var subtitle = "Very important data country by country";
var tableSearchWithMultipleColumns = {
	title: title$a,
	data: data$9,
	sources: sources$9,
	options: options$9,
	tool: tool,
	subtitle: subtitle
};

var title$9 = "FIXTURE: color column numeric";
var data$8 = {
	table: [
		[
			"String",
			"Number",
			"Number",
			"String"
		],
		[
			"Test1",
			"1",
			"2.1",
			"Test2"
		],
		[
			"Test2",
			"2",
			"2.2",
			"Test2"
		],
		[
			"Test3",
			"3",
			"2.3",
			"Test1"
		],
		[
			"Test4",
			"4",
			"2.41",
			"Test1"
		],
		[
			"Test5",
			"5",
			"2.5",
			"Test2"
		],
		[
			"Test6",
			"6",
			"2.61",
			"Test1"
		]
	],
	metaData: {
		cells: [
		]
	}
};
var sources$8 = [
];
var options$8 = {
	hideTableHeader: false,
	showTableSearch: false,
	cardLayout: false,
	cardLayoutIfSmall: false,
	minibar: {
		invertColors: false,
		barColor: {
			positive: {
				className: "",
				colorCode: ""
			},
			negative: {
				className: "",
				colorCode: ""
			}
		},
		selectedColumn: null
	},
	colorColumn: {
		colorColumnType: "numerical",
		numericalOptions: {
			labelLegend: "average",
			bucketType: "ckmeans",
			numberBuckets: 5,
			scale: "sequential",
			colorScheme: "one",
			colorOverwrites: [
			]
		},
		categoricalOptions: {
			colorOverwrites: [
			],
			customCategoriesOrder: [
			]
		},
		selectedColumn: 2
	}
};
var colorColumnNumerical = {
	title: title$9,
	data: data$8,
	sources: sources$8,
	options: options$8
};

var title$8 = "FIXTURE: color column numeric no legend label";
var data$7 = {
	table: [
		[
			"String",
			"Number",
			"Number",
			"String"
		],
		[
			"Test1",
			"1",
			"2.1",
			"Test2"
		],
		[
			"Test2",
			"2",
			"2.2",
			"Test2"
		],
		[
			"Test3",
			"3",
			"2.3",
			"Test1"
		],
		[
			"Test4",
			"4",
			"2.41",
			"Test1"
		],
		[
			"Test5",
			"5",
			"2.5",
			"Test2"
		],
		[
			"Test6",
			"6",
			"2.61",
			"Test1"
		]
	],
	metaData: {
		cells: [
		]
	}
};
var sources$7 = [
];
var options$7 = {
	hideTableHeader: false,
	showTableSearch: false,
	cardLayout: false,
	cardLayoutIfSmall: false,
	minibar: {
		invertColors: false,
		barColor: {
			positive: {
				className: "",
				colorCode: ""
			},
			negative: {
				className: "",
				colorCode: ""
			}
		},
		selectedColumn: null
	},
	colorColumn: {
		colorColumnType: "numerical",
		numericalOptions: {
			labelLegend: "noLabel",
			bucketType: "ckmeans",
			numberBuckets: 5,
			scale: "sequential",
			colorScheme: "one",
			colorOverwrites: [
			]
		},
		categoricalOptions: {
			colorOverwrites: [
			],
			customCategoriesOrder: [
			]
		},
		selectedColumn: 2
	}
};
var colorColumnNumericalNoLabel = {
	title: title$8,
	data: data$7,
	sources: sources$7,
	options: options$7
};

var title$7 = "FIXTURE: color column numeric no data";
var data$6 = {
	table: [
		[
			"String",
			"Number",
			"Number",
			"String"
		],
		[
			"Test1",
			"1",
			"2.1",
			"Test2"
		],
		[
			"Test2",
			"2",
			"2.2",
			"Test2"
		],
		[
			"Test3",
			"3",
			"2.3",
			"Test1"
		],
		[
			"Test4",
			"4",
			null,
			"Test1"
		],
		[
			"Test5",
			"5",
			"2.5",
			"Test2"
		],
		[
			"Test6",
			"6",
			"2.61",
			"Test1"
		]
	],
	metaData: {
		cells: [
		]
	}
};
var sources$6 = [
];
var options$6 = {
	hideTableHeader: false,
	showTableSearch: false,
	cardLayout: false,
	cardLayoutIfSmall: false,
	minibar: {
		invertColors: false,
		barColor: {
			positive: {
				className: "",
				colorCode: ""
			},
			negative: {
				className: "",
				colorCode: ""
			}
		},
		selectedColumn: null
	},
	colorColumn: {
		colorColumnType: "numerical",
		numericalOptions: {
			labelLegend: "average",
			bucketType: "ckmeans",
			numberBuckets: 5,
			scale: "sequential",
			colorScheme: "one",
			colorOverwrites: [
			]
		},
		categoricalOptions: {
			colorOverwrites: [
			],
			customCategoriesOrder: [
			]
		},
		selectedColumn: 2
	}
};
var colorColumnNumericalNoData = {
	title: title$7,
	data: data$6,
	sources: sources$6,
	options: options$6
};

var title$6 = "FIXTURE: color column numeric with footnotes";
var data$5 = {
	table: [
		[
			"String",
			"Number",
			"Number",
			"String"
		],
		[
			"Test1",
			"1",
			"2.1",
			"Test2"
		],
		[
			"Test2",
			"2",
			"2.2",
			"Test2"
		],
		[
			"Test3",
			"3",
			"2.3",
			"Test1"
		],
		[
			"Test4",
			"4",
			"2.41",
			"Test1"
		],
		[
			"Test5",
			"5",
			"2.5",
			"Test2"
		],
		[
			"Test6",
			"6",
			"2.61",
			"Test1"
		]
	],
	metaData: {
		cells: [
			{
				data: {
					footnote: "fussnote"
				},
				rowIndex: 4,
				colIndex: 2
			}
		]
	}
};
var sources$5 = [
];
var options$5 = {
	hideTableHeader: false,
	showTableSearch: false,
	cardLayout: false,
	cardLayoutIfSmall: false,
	minibar: {
		invertColors: false,
		barColor: {
			positive: {
				className: "",
				colorCode: ""
			},
			negative: {
				className: "",
				colorCode: ""
			}
		},
		selectedColumn: null
	},
	colorColumn: {
		colorColumnType: "numerical",
		numericalOptions: {
			labelLegend: "average",
			bucketType: "ckmeans",
			numberBuckets: 5,
			scale: "sequential",
			colorScheme: "one",
			colorOverwrites: [
			]
		},
		categoricalOptions: {
			colorOverwrites: [
			],
			customCategoriesOrder: [
			]
		},
		selectedColumn: 2
	}
};
var colorColumnNumericalFootnotes = {
	title: title$6,
	data: data$5,
	sources: sources$5,
	options: options$5
};

var title$5 = "FIXTURE: color column numeric custom color";
var data$4 = {
	table: [
		[
			"String",
			"Number",
			"Number",
			"String"
		],
		[
			"Test1",
			"1",
			"2.1",
			"Test2"
		],
		[
			"Test2",
			"2",
			"2.2",
			"Test2"
		],
		[
			"Test3",
			"3",
			"2.3",
			"Test1"
		],
		[
			"Test4",
			"4",
			"2.41",
			"Test1"
		],
		[
			"Test5",
			"5",
			"2.5",
			"Test2"
		],
		[
			"Test6",
			"6",
			"2.61",
			"Test1"
		]
	],
	metaData: {
		cells: [
			{
				data: {
					footnote: "fussnote"
				},
				rowIndex: 4,
				colIndex: 2
			}
		]
	}
};
var sources$4 = [
];
var options$4 = {
	hideTableHeader: false,
	showTableSearch: false,
	cardLayout: false,
	cardLayoutIfSmall: false,
	minibar: {
		invertColors: false,
		barColor: {
			positive: {
				className: "",
				colorCode: ""
			},
			negative: {
				className: "",
				colorCode: ""
			}
		},
		selectedColumn: null
	},
	colorColumn: {
		colorColumnType: "numerical",
		numericalOptions: {
			labelLegend: "noLabel",
			bucketType: "ckmeans",
			numberBuckets: 5,
			scale: "sequential",
			colorScheme: "one",
			colorOverwrites: [
				{
					textColor: "dark",
					color: "yellow",
					position: 0
				}
			]
		},
		categoricalOptions: {
			colorOverwrites: [
			],
			customCategoriesOrder: [
			]
		},
		selectedColumn: 2
	}
};
var colorColumnNumericalCustomColors = {
	title: title$5,
	data: data$4,
	sources: sources$4,
	options: options$4
};

var title$4 = "FIXTURE: color column categorical";
var data$3 = {
	table: [
		[
			"String",
			"Number",
			"Number",
			"String"
		],
		[
			"Test1",
			"1",
			"2.1",
			"Test2"
		],
		[
			"Test2",
			"2",
			"2.2",
			"Test2"
		],
		[
			"Test3",
			"3",
			"2.3",
			"Test1"
		],
		[
			"Test4",
			"4",
			"2.41",
			"Test1"
		],
		[
			"Test5",
			"5",
			"2.5",
			"Test2"
		],
		[
			"Test6",
			"6",
			"2.61",
			"Test1"
		]
	],
	metaData: {
		cells: [
		]
	}
};
var sources$3 = [
];
var options$3 = {
	hideTableHeader: false,
	showTableSearch: false,
	cardLayout: false,
	cardLayoutIfSmall: false,
	minibar: {
		invertColors: false,
		barColor: {
			positive: {
				className: "",
				colorCode: ""
			},
			negative: {
				className: "",
				colorCode: ""
			}
		},
		selectedColumn: null
	},
	colorColumn: {
		colorColumnType: "categorical",
		numericalOptions: {
			labelLegend: "noLabel",
			bucketType: "ckmeans",
			numberBuckets: 5,
			scale: "sequential",
			colorScheme: "one",
			colorOverwrites: [
				{
					textColor: "dark",
					color: "yellow",
					position: 1
				}
			]
		},
		categoricalOptions: {
			colorOverwrites: [
			],
			customCategoriesOrder: [
			]
		},
		selectedColumn: 3
	}
};
var colorColumnCategorical = {
	title: title$4,
	data: data$3,
	sources: sources$3,
	options: options$3
};

var title$3 = "FIXTURE: color column categorical footnotes";
var data$2 = {
	table: [
		[
			"String",
			"Number",
			"Number",
			"String"
		],
		[
			"Test1",
			"1",
			"2.1",
			"Test2"
		],
		[
			"Test2",
			"2",
			"2.2",
			"Test2"
		],
		[
			"Test3",
			"3",
			"2.3",
			"Test1"
		],
		[
			"Test4",
			"4",
			"2.41",
			"Test1"
		],
		[
			"Test5",
			"5",
			"2.5",
			"Test2"
		],
		[
			"Test6",
			"6",
			"2.61",
			"Test1"
		]
	],
	metaData: {
		cells: [
			{
				data: {
					footnote: "fussnote"
				},
				rowIndex: 4,
				colIndex: 3
			}
		]
	}
};
var sources$2 = [
];
var options$2 = {
	hideTableHeader: false,
	showTableSearch: false,
	cardLayout: false,
	cardLayoutIfSmall: false,
	minibar: {
		invertColors: false,
		barColor: {
			positive: {
				className: "",
				colorCode: ""
			},
			negative: {
				className: "",
				colorCode: ""
			}
		},
		selectedColumn: null
	},
	colorColumn: {
		colorColumnType: "categorical",
		numericalOptions: {
			labelLegend: "noLabel",
			bucketType: "ckmeans",
			numberBuckets: 5,
			scale: "sequential",
			colorScheme: "one",
			colorOverwrites: [
				{
					textColor: "dark",
					color: "yellow",
					position: 1
				}
			]
		},
		categoricalOptions: {
			colorOverwrites: [
			],
			customCategoriesOrder: [
			]
		},
		selectedColumn: 3
	}
};
var colorColumnCategoricalFootnotes = {
	title: title$3,
	data: data$2,
	sources: sources$2,
	options: options$2
};

var title$2 = "FIXTURE: color column categorical custom order";
var data$1 = {
	table: [
		[
			"String",
			"Number",
			"Number",
			"String"
		],
		[
			"Test1",
			"1",
			"2.1",
			"Test2"
		],
		[
			"Test2",
			"2",
			"2.2",
			"Test2"
		],
		[
			"Test3",
			"3",
			"2.3",
			"Test1"
		],
		[
			"Test4",
			"4",
			"2.41",
			"Test1"
		],
		[
			"Test5",
			"5",
			"2.5",
			"Test2"
		],
		[
			"Test6",
			"6",
			"2.61",
			"Test1"
		]
	],
	metaData: {
		cells: [
			{
				data: {
					footnote: "fussnote"
				},
				rowIndex: 4,
				colIndex: 3
			}
		]
	}
};
var sources$1 = [
];
var options$1 = {
	hideTableHeader: false,
	showTableSearch: false,
	cardLayout: false,
	cardLayoutIfSmall: false,
	minibar: {
		invertColors: false,
		barColor: {
			positive: {
				className: "",
				colorCode: ""
			},
			negative: {
				className: "",
				colorCode: ""
			}
		},
		selectedColumn: null
	},
	colorColumn: {
		colorColumnType: "categorical",
		numericalOptions: {
			labelLegend: "noLabel",
			bucketType: "ckmeans",
			numberBuckets: 5,
			scale: "sequential",
			colorScheme: "one",
			colorOverwrites: [
				{
					textColor: "dark",
					color: "yellow",
					position: 1
				}
			]
		},
		categoricalOptions: {
			colorOverwrites: [
			],
			customCategoriesOrder: [
				{
					category: "Test2"
				}
			]
		},
		selectedColumn: 3
	}
};
var colorColumnCategoricalCustomOrder = {
	title: title$2,
	data: data$1,
	sources: sources$1,
	options: options$1
};

var title$1 = "FIXTURE: color column categorical custom colors";
var data = {
	table: [
		[
			"String",
			"Number",
			"Number",
			"String"
		],
		[
			"Test1",
			"1",
			"2.1",
			"Test2"
		],
		[
			"Test2",
			"2",
			"2.2",
			"Test2"
		],
		[
			"Test3",
			"3",
			"2.3",
			"Test1"
		],
		[
			"Test4",
			"4",
			"2.41",
			"Test1"
		],
		[
			"Test5",
			"5",
			"2.5",
			"Test2"
		],
		[
			"Test6",
			"6",
			"2.61",
			"Test1"
		]
	],
	metaData: {
		cells: [
			{
				data: {
					footnote: "fussnote"
				},
				rowIndex: 4,
				colIndex: 3
			}
		]
	}
};
var sources = [
];
var options = {
	hideTableHeader: false,
	showTableSearch: false,
	cardLayout: false,
	cardLayoutIfSmall: false,
	minibar: {
		invertColors: false,
		barColor: {
			positive: {
				className: "",
				colorCode: ""
			},
			negative: {
				className: "",
				colorCode: ""
			}
		},
		selectedColumn: null
	},
	colorColumn: {
		colorColumnType: "categorical",
		numericalOptions: {
			labelLegend: "noLabel",
			bucketType: "ckmeans",
			numberBuckets: 5,
			scale: "sequential",
			colorScheme: "one",
			colorOverwrites: [
				{
					textColor: "dark",
					color: "yellow",
					position: 1
				}
			]
		},
		categoricalOptions: {
			colorOverwrites: [
				{
					textColor: "dark",
					color: "pink",
					position: 1
				},
				{
					textColor: "dark",
					color: "lightblue",
					position: 2
				}
			],
			customCategoriesOrder: [
			]
		},
		selectedColumn: 3
	}
};
var colorColumnCategoricalCustomColors = {
	title: title$1,
	data: data,
	sources: sources,
	options: options
};

const fixtureData = [
    twoColumn,
    fourColumn,
    fourColumnNoHeader,
    datesInData,
    mixedNumbersAndTextInCell,
    hyphenSignAsNumber,
    multilineText,
    showMoreButton,
    disappearingColumns,
    columnSpacing,
    minibarsMixed,
    minibarsPositive,
    minibarsNegative,
    minibarsHeaderWithNumbers,
    minibarsCustomClassName,
    minibarsCustomColorCode,
    displayFootnotes,
    displayMergedFootnotes,
    displayMergedFootnotesMultiple,
    displayFootnotesBeforeMinibar,
    displayAlotOfFootnotes,
    hideFootnotesInHeader,
    displayFootnotesInCardlayout,
    footnotesPositiveMinibars,
    footnotesNegativeMinibars,
    footnotesMixedMinibars,
    cardlayout,
    cardlayoutMobile,
    lotsOfData,
    pagination,
    frozenRow,
    specialCharacters,
    formattedNumbers,
    formattedNumbersMixed,
    formattedNumbersNegative,
    tableSearchHidden,
    tableSearchShow,
    tableSearchWithMultipleColumns,
    colorColumnNumerical,
    colorColumnNumericalNoLabel,
    colorColumnNumericalNoData,
    colorColumnNumericalFootnotes,
    colorColumnNumericalCustomColors,
    colorColumnCategorical,
    colorColumnCategoricalFootnotes,
    colorColumnCategoricalCustomOrder,
    colorColumnCategoricalCustomColors,
];
const route$2 = {
    path: '/fixtures/data',
    method: 'GET',
    options: {
        tags: ['api'],
    },
    handler: () => {
        return fixtureData;
    },
};

var DivergingType;
(function (DivergingType) {
    DivergingType["BUCKET"] = "bucket";
    DivergingType["BORDER"] = "border";
})(DivergingType || (DivergingType = {}));

const sequentialScaleMax = 7;
const divergingScaleMax = sequentialScaleMax * 2;
const route$1 = {
    method: 'POST',
    path: '/notification/numberBucketsOutOfColorScale',
    options: {
        validate: {
            options: {
                allowUnknown: true,
            },
            payload: Joi.object().required(),
        },
        tags: ['api'],
    },
    handler: function (request) {
        try {
            const payload = request.payload;
            const item = payload.item;
            const colorColumnSettings = item.options.colorColumn;
            const { colorColumnType, numericalOptions } = colorColumnSettings;
            const scale = numericalOptions.scale;
            if (colorColumnType === 'numerical') {
                const numberBuckets = getNumberBuckets(colorColumnSettings);
                if (scale === 'sequential' && numberBuckets > sequentialScaleMax) {
                    return {
                        message: {
                            title: 'notifications.numberBucketsOutOfColorScale.title',
                            body: 'notifications.numberBucketsOutOfColorScale.body',
                        },
                    };
                }
                else {
                    const divergingSpec = scale.split('-');
                    const divergingType = divergingSpec[0];
                    const divergingIndex = parseInt(divergingSpec[1]);
                    const numberBucketsLeft = divergingIndex;
                    let numberBucketsRight = numberBuckets - divergingIndex;
                    if (divergingType === DivergingType.BUCKET) {
                        numberBucketsRight -= 1;
                    }
                    const numberBucketsBiggerSide = Math.max(numberBucketsLeft, numberBucketsRight);
                    let scaleSize = numberBucketsBiggerSide * 2;
                    if (divergingType === DivergingType.BUCKET) {
                        scaleSize += 1;
                    }
                    if (scaleSize > divergingScaleMax) {
                        return {
                            message: {
                                title: 'notifications.numberBucketsOutOfColorScale.title',
                                body: 'notifications.numberBucketsOutOfColorScale.body',
                            },
                        };
                    }
                }
            }
        }
        catch (err) {
            console.log('Error processing /notification/numberBucketsOutOfColorScale', err);
        }
        return null;
    },
};

var numberBucketsExceedsDataSet = {
    method: 'POST',
    path: '/notification/numberBucketsExceedsDataSet',
    options: {
        validate: {
            options: {
                allowUnknown: true,
            },
            payload: Joi.object().required(),
        },
        tags: ['api'],
    },
    handler: function (request) {
        try {
            const payload = request.payload;
            const item = payload.item;
            const data = getDataWithoutHeaderRow(item.data.table);
            const colorColumnSettings = item.options.colorColumn;
            const { numericalOptions } = colorColumnSettings;
            if (numericalOptions.bucketType !== 'custom') {
                const numberUniqueValues = getUniqueCategoriesCount(data, colorColumnSettings);
                const numberBuckets = numericalOptions.numberBuckets;
                if (numberBuckets > numberUniqueValues) {
                    return {
                        message: {
                            title: 'notifications.numberBucketsExceedsDataSet.title',
                            body: 'notifications.numberBucketsExceedsDataSet.body',
                        },
                    };
                }
            }
        }
        catch (err) {
            console.log('Error processing /notification/numberBucketsExceedsDataSet', err);
        }
        return null;
    },
};

const numberMainColors = digitWords.length;
const route = {
    method: 'POST',
    path: '/notification/numberCategoriesOutOfColorScale',
    options: {
        validate: {
            options: {
                allowUnknown: true,
            },
            payload: Joi.object().required(),
        },
        tags: ['api'],
    },
    handler: function (request) {
        try {
            const payload = request.payload;
            const item = payload.item;
            const colorColumnSettings = item.options.colorColumn;
            if (item.options.colorColumn.colorColumnType === 'categorical') {
                const tableData = getDataWithoutHeaderRow(item.data.table);
                const numberUniqueValues = getUniqueCategoriesCount(tableData, colorColumnSettings);
                if (numberUniqueValues > numberMainColors) {
                    return {
                        message: {
                            title: 'notifications.numberCategoriesOutOfColorScale.title',
                            body: 'notifications.numberCategoriesOutOfColorScale.body',
                        },
                    };
                }
            }
        }
        catch (err) {
            console.log('Error processing /notification/numberCategoriesOutOfColorScale', err);
        }
        return null;
    },
};

var customBuckets = {
    method: 'POST',
    path: '/notification/customBuckets',
    options: {
        validate: {
            options: {
                allowUnknown: true,
            },
            payload: Joi.object().required(),
        },
        tags: ['api'],
    },
    handler: function (request) {
        try {
            const payload = request.payload;
            const item = payload.item;
            const data = getDataWithoutHeaderRow(item.data.table);
            const colorColumnSettings = item.options.colorColumn;
            const { numericalOptions, selectedColumn } = colorColumnSettings;
            const { bucketType, customBuckets } = numericalOptions;
            if (bucketType === 'custom' && typeof selectedColumn === 'number') {
                const bucketBorders = getCustomBucketBorders(customBuckets);
                const values = getNumericalValuesByColumn(data, selectedColumn);
                const numberValues = getNonNullValues(values);
                const metaData = getMetaData(values, numberValues, 0);
                if (bucketBorders[0] > metaData.minValue || bucketBorders[bucketBorders.length - 1] < metaData.maxValue) {
                    return {
                        message: {
                            title: 'notifications.customBuckets.title',
                            body: 'notifications.customBuckets.body',
                        },
                    };
                }
            }
        }
        catch (err) {
            console.log('Error processing /notification/customBuckets', err);
        }
        return null;
    },
};

var $schema = "http://json-schema.org/draft-04/schema#";
var type = "object";
var title = "Anzeigeoptionen";
var properties = {
	hideTitle: {
		type: "boolean",
		title: "Titel ausblenden"
	}
};
var displayOptionsSchema = {
	$schema: $schema,
	type: type,
	title: title,
	properties: properties
};

const schemaRoute = {
    method: 'GET',
    path: '/schema.json',
    handler: function (request, h) {
        return h.response(schema$1);
    },
};
const displayOptionsRoute = {
    method: 'GET',
    path: '/display-options-schema.json',
    handler: function (request, h) {
        return h.response(displayOptionsSchema);
    },
};
var schema = [schemaRoute, displayOptionsRoute];

const allRoutes = [
    route$k,
    route$j,
    optionAvailability,
    ...dynamicSchemas,
    route$5,
    route$4,
    route$3,
    route$2,
    route$1,
    numberBucketsExceedsDataSet,
    route,
    customBuckets,
    ...schema,
];

export { allRoutes as default };

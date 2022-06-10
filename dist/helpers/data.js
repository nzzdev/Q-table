import Array2D from 'array2d';
import { formatLocale as d3FormatLocale } from 'd3-format';
import { appendFootnoteAnnotationsToTableData } from './footnotes.js';
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
export function getNumericColumns(data) {
    const columns = getColumnsType(data);
    const numericColumns = [];
    // data[0].length is undefined when creating a new item
    if (data[0] !== undefined) {
        Array2D.forRow(data, 0, (cell, rowIndex, columnIndex) => {
            if (columns[columnIndex] && columns[columnIndex].isNumeric) {
                numericColumns.push({ title: cell, index: columnIndex });
            }
        });
    }
    return numericColumns;
}
export function getCategoricalColumns(data) {
    const categoricalColumns = [];
    // data[0].length is undefined when creating a new item
    if (data[0] !== undefined) {
        Array2D.forRow(data, 0, (cell, rowIndex, columnIndex) => {
            categoricalColumns.push({ title: cell, index: columnIndex });
        });
    }
    return categoricalColumns;
}
export function isNumeric(cell) {
    if (typeof cell !== 'string') {
        return false;
    }
    const parsed = parseFloat(cell);
    if (isNaN(parsed)) {
        return false;
    }
    return true;
}
function getColumnsType(data) {
    const columns = [];
    const table = getDataWithoutHeaderRow(data);
    Array2D.eachColumn(table, (column) => {
        let withFormating = false;
        const columnNumeric = isColumnNumeric(column);
        if (columnNumeric) {
            const numbersOfColumn = column.map((number) => isNumeric(number) ? parseFloat(number) : null);
            withFormating =
                Math.max(...numbersOfColumn) >= 10000 ||
                    Math.min(...numbersOfColumn) <= -10000;
        }
        columns.push({ isNumeric: columnNumeric, withFormating });
    });
    return columns;
}
function isColumnNumeric(column) {
    // If we find one cell that is numeric then it is a numeric column.
    for (let i = 0; i < column.length; i++) {
        const value = column[i];
        if (isNumeric(value)) {
            return true;
        }
    }
    return false;
}
export function formatTableData(data, footnotes, options) {
    const columns = getColumnsType(data);
    let tableData = [];
    Array2D.eachRow(data, (row, rowIndex) => {
        let cells = row.map((cell, columnIndex) => {
            let type = 'text';
            let value = cell;
            let classes = [];
            if (columns[columnIndex] && columns[columnIndex].isNumeric) {
                type = 'numeric';
                classes.push('s-font-note--tabularnums');
                // do not format the header row, empty cells, a hyphen(-) or a en dash (–)
                if (rowIndex > 0 &&
                    cell !== null &&
                    cell !== '' &&
                    cell != '-' &&
                    cell != enDash) {
                    if (columns[columnIndex].withFormating) {
                        value = formatWithGroupingSeparator(cell);
                    }
                    else {
                        value = formatNoGroupingSeparator(cell);
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
    });
    if (footnotes.length > 0) {
        tableData = appendFootnoteAnnotationsToTableData(tableData, footnotes, options);
    }
    return tableData;
}
export function getNumericalValuesByColumn(data, column) {
    return data.map((row) => {
        if (!row[column])
            row[column] = null;
        const val = row[column];
        let return_val = null;
        if (typeof val === 'string' && val.match(/^[+-]?\d+(\.\d+)?$/)) {
            return_val = parseFloat(val);
        }
        else {
            throw new Error('value is not a valid floating point number');
        }
        return return_val;
    });
}
export function getCategoricalValuesByColumn(data, column) {
    return data.map((row) => {
        if (!row[column])
            row[column] = null;
        return row[column];
    });
}
export function getNonNullValues(values) {
    return values.filter(value => value !== null);
}
export function getMetaData(values, numberValues, maxDigitsAfterComma) {
    return {
        hasNullValues: values.find((value) => value === null) !== undefined,
        hasZeroValues: numberValues.find((value) => value === 0) !== undefined,
        maxValue: Math.max(...numberValues),
        minValue: Math.min(...numberValues),
        averageValue: getRoundedAverage(numberValues, maxDigitsAfterComma),
        medianValue: getRoundedMedian(numberValues, maxDigitsAfterComma),
    };
}
export function getDataWithoutHeaderRow(data) {
    return data.slice(1);
}
export function getUniqueCategoriesCount(data, colorColumn) {
    return getUniqueCategoriesObject(data, colorColumn).categories.length;
}
export function getUniqueCategoriesObject(data, colorColumnSettings) {
    const { categoricalOptions, selectedColumn } = colorColumnSettings;
    let customCategoriesOrder = categoricalOptions.customCategoriesOrder;
    let hasNullValues = false;
    let values = [];
    if (typeof selectedColumn === 'number') {
        values = data
            .map(row => row[selectedColumn])
            .filter((value) => {
            if (value !== null && value !== '') {
                return true;
            }
            hasNullValues = true;
            return false;
        });
    }
    let sortedValuesbyCount = sortValuesByCount(values);
    // If the user has set a custom order, sort the categories accordingly
    if (customCategoriesOrder) {
        sortedValuesbyCount.sort(function (a, b) {
            return (customCategoriesOrder.map((c) => c.category).indexOf(a) -
                customCategoriesOrder.map((c) => c.category).indexOf(b));
        });
    }
    const categories = Array.from(new Set(sortedValuesbyCount));
    return { hasNullValues, categories };
}
function sortValuesByCount(values) {
    // Count how much each value appears.
    let counter = {};
    for (let i = 0; i < values.length; i++) {
        const key = values[i];
        counter[key] = 1 + counter[key] || 1;
    }
    // Sort counter by amount of appearance.
    let sortedCounter = Object.entries(counter).sort((a, b) => b[1] - a[1]);
    // Return only the values. The amount of appearance is not necessary.
    return sortedCounter.map(x => x[0]);
}
export function getMaxDigitsAfterCommaInDataByRow(data, rowIndex) {
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
function getDigitsAfterComma(value) {
    const digitsAfterComma = value.split('.');
    if (digitsAfterComma.length > 1) {
        return digitsAfterComma[1].length;
    }
    return 0;
}
export function getFormattedValue(formattingOptions, value) {
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
    }
    else {
        return formatLocaleSmall.format(formatSpecifier)(value);
    }
}
export function getFormattedBuckets(formattingOptions, buckets) {
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
export function getRoundedValue(value, maxDigitsAfterComma) {
    // Default: round to two digits after comma.
    let roundingFactor = 100;
    // If data contains more precise float numbers we extend
    // each value to max number of digits after comma.
    if (maxDigitsAfterComma !== undefined && maxDigitsAfterComma > 2) {
        roundingFactor = Math.pow(10, maxDigitsAfterComma);
    }
    return Math.round(value * roundingFactor) / roundingFactor;
}
export function getCustomBucketBorders(customBuckets) {
    const customBorderStrings = customBuckets.split(',');
    return customBorderStrings.map((value) => {
        return parseFloat(value.trim());
    });
}
/**
 * Internal.
 */
function getMedian(values) {
    let middleIndex = Math.floor(values.length / 2);
    let sortedNumbers = [...values].sort((a, b) => a - b);
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

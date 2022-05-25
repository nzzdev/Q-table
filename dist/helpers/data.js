var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var clone = require("clone");
var d3 = {
    format: require("d3-format")
};
var Array2D = require("array2d");
var appendFootnoteAnnotationsToTableData = require("./footnotes.js").appendFootnoteAnnotationsToTableData;
var fourPerEmSpace = "\u2005";
var enDash = "\u2013";
var formatLocale = d3.format.formatLocale({
    decimal: ",",
    thousands: fourPerEmSpace,
    minus: enDash,
    grouping: [3]
});
var formatLocaleSmall = d3.format.formatLocale({
    decimal: ",",
    minus: enDash
});
var formatGrouping = formatLocale.format(",");
var formatNoGrouping = formatLocale.format("");
function isNumeric(cell) {
    if (!cell) {
        return false;
    }
    cell = cell.trim(); // remove whitespaces
    if (cell.match(/^[+-]?\d+(\.\d+)?$/) === null) {
        return false;
    }
    return cell && !Number.isNaN(parseFloat(cell));
}
function getColumnsType(data) {
    var columns = [];
    var table = getDataWithoutHeaderRow(data);
    Array2D.eachColumn(table, function (column) {
        var withFormating = false;
        var columnEmpty = column.every(function (cell) {
            return cell === null || cell === "" || cell === "-" || cell === "–";
        });
        var isColumnNumeric = column.every(function (cell) {
            return (!columnEmpty &&
                (isNumeric(cell) ||
                    cell === null ||
                    cell === "" ||
                    cell === "-" ||
                    cell === "–"));
        });
        if (isColumnNumeric) {
            var numbersOfColumn = column.map(function (number) {
                return isNumeric(number) ? parseFloat(number) : null;
            });
            withFormating =
                Math.max.apply(Math, numbersOfColumn) >= 10000 ||
                    Math.min.apply(Math, numbersOfColumn) <= -10000;
        }
        columns.push({ isNumeric: isColumnNumeric, withFormating: withFormating });
    });
    return columns;
}
function getNumericColumns(data) {
    var columns = getColumnsType(data);
    var numericColumns = [];
    // data[0].length is undefined when creating a new item
    if (data[0] !== undefined) {
        Array2D.forRow(data, 0, function (cell, rowIndex, columnIndex) {
            if (columns[columnIndex] && columns[columnIndex].isNumeric) {
                numericColumns.push({ title: cell, index: columnIndex });
            }
        });
    }
    return numericColumns;
}
function getCategoricalColumns(data) {
    var columns = getColumnsType(data);
    var categoricalColumns = [];
    // data[0].length is undefined when creating a new item
    if (data[0] !== undefined) {
        Array2D.forRow(data, 0, function (cell, rowIndex, columnIndex) {
            categoricalColumns.push({ title: cell, index: columnIndex });
        });
    }
    return categoricalColumns;
}
function getTableData(data, footnotes, options) {
    var columns = getColumnsType(data);
    var tableData = [];
    Array2D.eachRow(data, function (row, rowIndex) {
        var cells = row.map(function (cell, columnIndex) {
            var type = "text";
            var value = cell;
            var classes = [];
            if (columns[columnIndex] && columns[columnIndex].isNumeric) {
                type = "numeric";
                classes.push("s-font-note--tabularnums");
                // do not format the header row, empty cells, a hyphen(-) or a en dash (–)
                if (rowIndex > 0 &&
                    cell !== null &&
                    cell !== "" &&
                    cell != "-" &&
                    cell != enDash) {
                    if (columns[columnIndex].withFormating) {
                        value = formatGrouping(cell);
                    }
                    else {
                        value = formatNoGrouping(cell);
                    }
                }
            }
            return {
                type: type,
                value: value,
                classes: classes
            };
        });
        tableData.push(cells);
    });
    if (footnotes.length > 0) {
        tableData = appendFootnoteAnnotationsToTableData(tableData, footnotes, options);
    }
    return tableData;
}
function getNumericalValuesByColumn(data, column) {
    return data.map(function (row) {
        if (!row[column])
            row[column] = null;
        if (row[column] !== null) {
            if (row[column].match(/^[+-]?\d+(\.\d+)?$/) === null) {
                throw new Error("value is not a valid floating point number");
            }
            return parseFloat(row[column]);
        }
        return row[column];
    });
}
function getCategoricalValuesByColumn(data, column) {
    return data.map(function (row) {
        if (!row[column])
            row[column] = null;
        return row[column];
    });
}
function getNonNullValues(values) {
    return values.filter(function (value) { return value !== null; });
}
function getMetaData(values, numberValues, maxDigitsAfterComma) {
    return {
        hasNullValues: values.find(function (value) { return value === null; }) !== undefined,
        hasZeroValues: numberValues.find(function (value) { return value === 0; }) !== undefined,
        maxValue: Math.max.apply(Math, numberValues),
        minValue: Math.min.apply(Math, numberValues),
        averageValue: getRoundedAverage(numberValues, maxDigitsAfterComma),
        medianValue: getRoundedMedian(numberValues, maxDigitsAfterComma)
    };
}
function getDataWithoutHeaderRow(data) {
    return data.slice(1);
}
function getUniqueCategoriesCount(data, colorColumn) {
    return getUniqueCategoriesObject(data, colorColumn).categories.length;
}
function getUniqueCategoriesObject(data, colorColumn) {
    var hasNullValues = false;
    var customCategoriesOrder = colorColumn.categoricalOptions.customCategoriesOrder;
    var values = data
        .map(function (row) {
        return row[colorColumn.selectedColumn];
    })
        .filter(function (value) {
        if (value !== null && value !== "") {
            return true;
        }
        hasNullValues = true;
        return false;
    });
    var sortedValues = getSortedValues(values);
    // If the user has set a custom order, sort the categories accordingly
    if (customCategoriesOrder) {
        sortedValues.sort(function (a, b) {
            return (customCategoriesOrder.map(function (c) { return c.category; }).indexOf(a) -
                customCategoriesOrder.map(function (c) { return c.category; }).indexOf(b));
        });
    }
    return { hasNullValues: hasNullValues, categories: __spreadArray([], new Set(sortedValues), true) };
}
function getSortedValues(values) {
    // Create a counter object on array
    var counter = values.reduce(function (counter, key) {
        counter[key] = 1 + counter[key] || 1;
        return counter;
    }, {});
    // Sort counter by values
    var sortedCounter = Object.entries(counter).sort(function (a, b) { return b[1] - a[1]; });
    return sortedCounter.map(function (x) { return x[0]; });
}
function getMaxDigitsAfterCommaInDataByRow(data, rowIndex) {
    var maxDigitsAfterComma = 0;
    data.forEach(function (row) {
        var digitsAfterComma = getDigitsAfterComma(row[rowIndex]);
        maxDigitsAfterComma = Math.max(maxDigitsAfterComma, digitsAfterComma);
    });
    return maxDigitsAfterComma;
}
function getDigitsAfterComma(value) {
    try {
        if (value !== undefined && value !== null) {
            var valueParts = value.toString().split(".");
            if (valueParts.length > 1) {
                return valueParts[1].length;
            }
        }
        return 0;
    }
    catch (e) {
        return 0; // if something goes wrong we just return 0 digits after comma
    }
}
function getFormattedValue(formattingOptions, value) {
    if (value === null) {
        return value;
    }
    var formatSpecifier = ",";
    // if we have float values in data set we extend all float values
    // to max number of positions after comma, e.g. format specifier
    // could be ",.2f" for 2 positions after comma
    if (formattingOptions.maxDigitsAfterComma) {
        formatSpecifier = ",.".concat(formattingOptions.maxDigitsAfterComma, "f");
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
    return buckets.map(function (bucket) {
        var from = bucket.from, to = bucket.to, color = bucket.color;
        if (formattingOptions.roundingBucketBorders) {
            return {
                from: getFormattedValue(formattingOptions, from),
                to: getFormattedValue(formattingOptions, to),
                color: color
            };
        }
        return {
            from: getFormattedValue({}, from),
            to: getFormattedValue({}, to),
            color: color
        };
    });
}
function getMedian(values) {
    var middleIndex = Math.floor(values.length / 2);
    var sortedNumbers = __spreadArray([], values, true).sort(function (a, b) { return a - b; });
    if (values.length % 2 !== 0) {
        return sortedNumbers[middleIndex];
    }
    return (sortedNumbers[middleIndex - 1] + sortedNumbers[middleIndex]) / 2;
}
function getRoundedMedian(values, maxDigitsAfterComma) {
    var medianValue = getMedian(values);
    return getRoundedValue(medianValue, maxDigitsAfterComma);
}
function getAverage(values) {
    return values.reduce(function (a, b) { return a + b; }, 0) / values.length;
}
function getRoundedAverage(values, maxDigitsAfterComma) {
    var averageValue = getAverage(values);
    return getRoundedValue(averageValue, maxDigitsAfterComma);
}
function getRoundedValue(value, maxDigitsAfterComma) {
    var roundingFactor = 100; // default: round to two digits after comma
    // if data contains more precise float numbers we extend each value to max number of digits after comma
    if (maxDigitsAfterComma !== undefined && maxDigitsAfterComma > 2) {
        roundingFactor = Math.pow(10, maxDigitsAfterComma);
    }
    return Math.round(value * roundingFactor) / roundingFactor;
}
function getCustomBucketBorders(customBuckets) {
    var customBorderStrings = customBuckets.split(",");
    return customBorderStrings.map(function (borderValue) {
        return parseFloat(borderValue.trim());
    });
}
module.exports = {
    getTableData: getTableData,
    getNumericColumns: getNumericColumns,
    getCategoricalColumns: getCategoricalColumns,
    isNumeric: isNumeric,
    getNumericalValuesByColumn: getNumericalValuesByColumn,
    getCategoricalValuesByColumn: getCategoricalValuesByColumn,
    getNonNullValues: getNonNullValues,
    getMetaData: getMetaData,
    getDataWithoutHeaderRow: getDataWithoutHeaderRow,
    getUniqueCategoriesCount: getUniqueCategoriesCount,
    getUniqueCategoriesObject: getUniqueCategoriesObject,
    getMaxDigitsAfterCommaInDataByRow: getMaxDigitsAfterCommaInDataByRow,
    getFormattedValue: getFormattedValue,
    getFormattedBuckets: getFormattedBuckets,
    getRoundedValue: getRoundedValue,
    getCustomBucketBorders: getCustomBucketBorders
};

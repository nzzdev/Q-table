const clone = require("clone");
const d3 = {
  format: require("d3-format"),
};
const Array2D = require("array2d");
const appendFootnoteAnnotationsToTableData =
  require("./footnotes.js").appendFootnoteAnnotationsToTableData;

const fourPerEmSpace = "\u2005";
const enDash = "\u2013";

const formatLocale = d3.format.formatLocale({
  decimal: ",",
  thousands: fourPerEmSpace,
  minus: enDash,
  grouping: [3],
});

const formatLocaleSmall = d3.format.formatLocale({
  decimal: ",",
  minus: enDash,
});

const formatGrouping = formatLocale.format(",");
const formatNoGrouping = formatLocale.format("");

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
  const columns = [];
  const table = getDataWithoutHeaderRow(data);

  Array2D.eachColumn(table, (column) => {
    let withFormating = false;
    let columnEmpty = column.every((cell) => {
      return cell === null || cell === "" || cell === "-" || cell === "–";
    });
    let isColumnNumeric = column.every((cell) => {
      return (
        !columnEmpty &&
        (isNumeric(cell) ||
          cell === null ||
          cell === "" ||
          cell === "-" ||
          cell === "–")
      );
    });
    if (isColumnNumeric) {
      const numbersOfColumn = column.map((number) =>
        isNumeric(number) ? parseFloat(number) : null
      );
      withFormating =
        Math.max(...numbersOfColumn) >= 10000 ||
        Math.min(...numbersOfColumn) <= -10000;
    }
    columns.push({ isNumeric: isColumnNumeric, withFormating });
  });
  return columns;
}

function getNumericColumns(data) {
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

function getCategoricalColumns(data) {
  const columns = getColumnsType(data);
  const categoricalColumns = [];
  // data[0].length is undefined when creating a new item
  if (data[0] !== undefined) {
    Array2D.forRow(data, 0, (cell, rowIndex, columnIndex) => {
      categoricalColumns.push({ title: cell, index: columnIndex });
    });
  }
  return categoricalColumns;
}

function getTableData(data, footnotes, options) {
  const columns = getColumnsType(data);
  let tableData = [];
  Array2D.eachRow(data, (row, rowIndex) => {
    let cells = row.map((cell, columnIndex) => {
      let type = "text";
      let value = cell;
      let classes = [];
      if (columns[columnIndex] && columns[columnIndex].isNumeric) {
        type = "numeric";
        classes.push("s-font-note--tabularnums");

        // do not format the header row, empty cells, a hyphen(-) or a en dash (–)
        if (
          rowIndex > 0 &&
          cell !== null &&
          cell !== "" &&
          cell != "-" &&
          cell != enDash
        ) {
          if (columns[columnIndex].withFormating) {
            value = formatGrouping(cell);
          } else {
            value = formatNoGrouping(cell);
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
    tableData = appendFootnoteAnnotationsToTableData(
      tableData,
      footnotes,
      options
    );
  }

  return tableData;
}

function getNumericalValuesByColumn(data, column) {
  return data.map((row) => {
    if (!row[column]) row[column] = null;
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
  return data.map((row) => {
    if (!row[column]) row[column] = null;
    return row[column];
  });
}

function getNonNullValues(values) {
  return values.filter((value) => value !== null);
}

function getMetaData(values, numberValues, maxDigitsAfterComma) {
  return {
    hasNullValues: values.find((value) => value === null) !== undefined,
    hasZeroValues: numberValues.find((value) => value === 0) !== undefined,
    maxValue: Math.max(...numberValues),
    minValue: Math.min(...numberValues),
    averageValue: getRoundedAverage(numberValues, maxDigitsAfterComma),
    medianValue: getRoundedMedian(numberValues, maxDigitsAfterComma),
  };
}

function getDataWithoutHeaderRow(data: string[][]) {
  return data.slice(1);
}

function getUniqueCategoriesCount(data, colorColumn) {
  return getUniqueCategoriesObject(data, colorColumn).categories.length;
}

function getUniqueCategoriesObject(data, colorColumn) {
  let hasNullValues = false;
  let customCategoriesOrder =
    colorColumn.categoricalOptions.customCategoriesOrder;
  const values = data
    .map((row) => {
      return row[colorColumn.selectedColumn];
    })
    .filter((value) => {
      if (value !== null && value !== "") {
        return true;
      }
      hasNullValues = true;
      return false;
    });
  let sortedValues = getSortedValues(values);

  // If the user has set a custom order, sort the categories accordingly
  if (customCategoriesOrder) {
    sortedValues.sort(function (a, b) {
      return (
        customCategoriesOrder.map((c) => c.category).indexOf(a) -
        customCategoriesOrder.map((c) => c.category).indexOf(b)
      );
    });
  }

  return { hasNullValues, categories: [...new Set(sortedValues)] };
}

function getSortedValues(values) {
  // Create a counter object on array
  let counter = values.reduce((counter, key) => {
    counter[key] = 1 + counter[key] || 1;
    return counter;
  }, {});

  // Sort counter by values
  let sortedCounter = Object.entries(counter).sort((a, b) => b[1] - a[1]);
  return sortedCounter.map((x) => x[0]);
}

function getMaxDigitsAfterCommaInDataByRow(data, rowIndex) {
  let maxDigitsAfterComma = 0;
  data.forEach((row) => {
    const digitsAfterComma = getDigitsAfterComma(row[rowIndex]);
    maxDigitsAfterComma = Math.max(maxDigitsAfterComma, digitsAfterComma);
  });
  return maxDigitsAfterComma;
}

function getDigitsAfterComma(value) {
  try {
    if (value !== undefined && value !== null) {
      const valueParts = value.toString().split(".");
      if (valueParts.length > 1) {
        return valueParts[1].length;
      }
    }
    return 0;
  } catch (e) {
    return 0; // if something goes wrong we just return 0 digits after comma
  }
}

function getFormattedValue(formattingOptions, value) {
  if (value === null) {
    return value;
  }

  let formatSpecifier = ",";

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

function getFormattedBuckets(formattingOptions, buckets) {
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

function getRoundedValue(value, maxDigitsAfterComma) {
  let roundingFactor = 100; // default: round to two digits after comma
  // if data contains more precise float numbers we extend each value to max number of digits after comma
  if (maxDigitsAfterComma !== undefined && maxDigitsAfterComma > 2) {
    roundingFactor = Math.pow(10, maxDigitsAfterComma);
  }
  return Math.round(value * roundingFactor) / roundingFactor;
}

function getCustomBucketBorders(customBuckets) {
  const customBorderStrings = customBuckets.split(",");
  return customBorderStrings.map((borderValue) => {
    return parseFloat(borderValue.trim());
  });
}

module.exports = {
  getTableData: getTableData,
  getNumericColumns,
  getCategoricalColumns,
  isNumeric: isNumeric,
  getNumericalValuesByColumn,
  getCategoricalValuesByColumn,
  getNonNullValues,
  getMetaData,
  getDataWithoutHeaderRow,
  getUniqueCategoriesCount,
  getUniqueCategoriesObject,
  getMaxDigitsAfterCommaInDataByRow,
  getFormattedValue,
  getFormattedBuckets,
  getRoundedValue,
  getCustomBucketBorders,
};

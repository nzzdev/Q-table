const clone = require("clone");
const d3 = {
  format: require("d3-format")
};

const formatLocale = d3.format.formatLocale({
  decimal: ",",
  thousands: " ", // this is a viertelgeviert U+2005
  grouping: [3]
});

const miniBarTypes = {
  positive: "positive",
  negative: "negative",
  mixed: "mixed",
  empty: "empty"
};

const formatGrouping = formatLocale.format(",");
const formatNoGrouping = formatLocale.format("");

function prepareSelectedColumn(data, selectedColumnIndex) {
  let preparedData = {
    items: [],
    numbers: []
  };
  let typeAmount = {
    positives: 0,
    negatives: 0
  };

  let dataCopy = clone(data);
  dataCopy[0] = dataCopy[0].map(cell => (cell = "")); // first row is always header so ignore it

  dataCopy.map(row => {
    let value = row[selectedColumnIndex];
    let type = miniBarTypes.positive;

    if (value < 0) {
      type = miniBarTypes.negative;
      typeAmount.negatives++;
    } else if (value > 0) {
      type = miniBarTypes.positive;
      typeAmount.positives++;
    } else {
      type = miniBarTypes.empty;
    }

    if (isNumeric(value) || parseFloat(value)) {
      preparedData.numbers.push(parseFloat(value));
      preparedData.items.push({ value: parseFloat(value), type });
    } else {
      preparedData.items.push({ value: null, type });
    }
  });

  preparedData.type = getMinibarType(typeAmount);
  return preparedData;
}

function getMinibarValue(type, value, min, max) {
  if (type === miniBarTypes.positive) {
    return Math.abs((value * 100) / max);
  } else if (type === miniBarTypes.negative) {
    return Math.abs((value * 100) / min);
  } else {
    return Math.abs((value * 100) / Math.max(Math.abs(min), Math.abs(max))) / 2; // divided by 2 because max. value is 50%
  }
}

function getMinibarType(types) {
  if (types.positives > 0 && types.negatives === 0) {
    return miniBarTypes.positive;
  } else if (types.negatives > 0 && types.positives === 0) {
    return miniBarTypes.negative;
  } else {
    return miniBarTypes.mixed;
  }
}

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

function isColumnNumeric(data, columnIndex) {
  let isColumnNumeric = false;
  for (let row of clone(data).slice(1)) {
    if (
      isNumeric(row[columnIndex]) === true ||
      row[columnIndex] === null ||
      row[columnIndex] === "" ||
      row[columnIndex] === "-"
    ) {
      // if the cell is empty or is a hyphen(-), we treat it as potentially numeric here
      isColumnNumeric = true;
    } else {
      return false;
    }
  }
  return isColumnNumeric;
}

function getNumericColumns(data) {
  let numericColumns = [];
  // data[0].length is undefined when creating a new item
  if (data[0] !== undefined) {
    for (var i = 0; i <= data[0].length; i++) {
      if (isColumnNumeric(data, i)) {
        numericColumns.push({ title: data[0][i], index: i });
      }
    }
  }
  return numericColumns;
}

function getTableData(data, footnotes, options) {
  let tableData = data.map((row, rowIndex) => {
    return row.map((cell, columnIndex) => {
      let type = "text";
      let value = cell;
      if (isColumnNumeric(data, columnIndex)) {
        type = "numeric";
        // do not format the header row, empty cells or a hyphen(-)
        if (rowIndex > 0 && cell !== null && cell !== "" && cell != "-") {
          if (Math.abs(parseFloat(cell)) >= 10000) {
            value = formatGrouping(cell);
          } else {
            value = formatNoGrouping(cell);
          }
        }
      }

      return {
        type: type,
        value: value
      };
    });
  });
  return appendFootnotesToData(tableData, footnotes, options);
}

function appendFootnotesToData(tableData, footnotes, options) {
  const unicodes = {
    1: "\u00b9",
    2: "\u00b2",
    3: "\u00b3",
    4: "\u2074",
    5: "\u2075",
    6: "\u2076",
    7: "\u2077",
    8: "\u2078",
    9: "\u2079"
  };
  let footnoteSpacings = [];

  footnotes.forEach((footnote, index) => {
    let footnoteSpacing = getFootnoteSpacing(
      options,
      footnote,
      footnotes.length,
      tableData[footnote.rowIndex][footnote.colIndex].type,
      tableData[footnote.rowIndex].length - 1
    );
    footnoteSpacings.push({
      colIndex: footnote.colIndex,
      class: footnoteSpacing
    });
    // create a new property to safe the index of the footnote
    tableData[footnote.rowIndex][footnote.colIndex].footnote = {
      value: index + 1,
      unicode: unicodes[index + 1],
      spacingClass: footnoteSpacing
    };
  });

  tableData.forEach(row => {
    footnoteSpacings.forEach(footnoteSpacing => {
      row[footnoteSpacing.colIndex].spacingClass = footnoteSpacing.class;
    });
  });

  return tableData;
}

function getFootnoteSpacing(
  options,
  footnote,
  amountOfFootnotes,
  type,
  lastColIndex
) {
  // if the column of the footnote is a number, minibar or a minibar follows, add some spacing depending on how many footnotes are displayed. Or footnote is displayed in the last column
  if (
    (type === "numeric" &&
      (options.minibar.selectedColumn === footnote.colIndex ||
        options.minibar.selectedColumn === footnote.colIndex + 1)) ||
    footnote.colIndex === lastColIndex
  ) {
    let spacingClass = "q-table-col-footnotes";
    if (amountOfFootnotes >= 10) {
      spacingClass += "-double";
    } else {
      spacingClass += "-single";
    }
    return spacingClass;
  }
  return null;
}

function prepareFootnotes(metaData, hideTableHeader) {
  return metaData.cells
    .filter(cell => {
      if (!cell.data.footnote || (hideTableHeader && cell.rowIndex === 0)) {
        return false;
      }
      return true;
    }) // remove cells with no footnotes
    .sort((a, b) => {
      // sorting metaData to display them chronologically
      if (a.rowIndex !== b.rowIndex) {
        return a.rowIndex - b.rowIndex;
      }
      return a.colIndex - b.colIndex;
    });
}

function getFootnoteColIndexes(footnotes) {
  let colsWithFootnotes = [];
  footnotes.forEach(footnote => {
    if (!colsWithFootnotes.includes(footnote.colIndex)) {
      colsWithFootnotes.push(footnote.colIndex);
    }
  });
  return colsWithFootnotes;
}

function getDataForMinibars(data, selectedColumnIndex) {
  let dataColumn = prepareSelectedColumn(data, selectedColumnIndex);
  let minValue = Math.min(...dataColumn.numbers);
  let maxValue = Math.max(...dataColumn.numbers);

  let values = dataColumn.items.map(item => {
    return {
      type: item.type,
      value: getMinibarValue(dataColumn.type, item.value, minValue, maxValue)
    };
  });

  return {
    values: values,
    type: dataColumn.type
  };
}

module.exports = {
  getTableData: getTableData,
  getDataForMinibars: getDataForMinibars,
  getNumericColumns: getNumericColumns,
  prepareSelectedColumn: prepareSelectedColumn,
  prepareFootnotes: prepareFootnotes,
  getFootnoteColIndexes: getFootnoteColIndexes
};

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
  dataCopy[0].map(cell => (cell.value = "")); // first row is always header so ignore it

  dataCopy.map((row, index) => {
    let value = row[selectedColumnIndex + 1].value;

    value !== null
      ? (value = value.replace(/\s/g, "").replace(",", "."))
      : value;

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
  for (var i = 0; i <= data[0].length; i++) {
    if (isColumnNumeric(data, i)) {
      numericColumns.push({ title: data[0][i], index: i - 1 });
    }
  }
  return numericColumns;
}

function getDataForTemplate(data) {
  return data.map((row, rowIndex) => {
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
}

function getDataForMinibars(data, selectedColumnIndex, hideTableHeader) {
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
  getDataForTemplate: getDataForTemplate,
  getDataForMinibars: getDataForMinibars,
  getNumericColumns: getNumericColumns,
  getMinibarType: getMinibarType
};

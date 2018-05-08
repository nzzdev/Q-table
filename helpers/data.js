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
    values: [],
    numbers: []
  };

  data.map(row => {
    if (isNumeric(row[selectedColumnIndex + 1].value)) {
      preparedData.numbers.push(parseFloat(row[selectedColumnIndex + 1].value));
      preparedData.values.push(parseFloat(row[selectedColumnIndex + 1].value));
    } else {
      preparedData.values.push(null);
    }
  });

  return preparedData;
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
  let valueSpan =
    Math.abs(Math.min(...dataColumn.numbers)) +
    Math.abs(Math.max(...dataColumn.numbers)); // this is 100% of the cell-width
  let typeAmount = {
    positives: 0,
    negatives: 0
  };

  let values = dataColumn.values.map(element => {
    let type = miniBarTypes.positive;
    if (element < 0) {
      type = miniBarTypes.negative;
      typeAmount.negatives++;
    } else if (element > 0) {
      typeAmount.positives++;
    } else {
      type = miniBarTypes.empty;
    }

    return {
      type: type,
      value:
        type !== miniBarTypes.empty
          ? Math.abs(element * 100 / valueSpan)
          : element
    };
  });

  return {
    values: values,
    type: getMinibarType(typeAmount)
  };
}

module.exports = {
  getDataForTemplate: getDataForTemplate,
  getDataForMinibars: getDataForMinibars
};

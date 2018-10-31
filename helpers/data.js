const clone = require("clone");
const d3 = {
  format: require("d3-format")
};
const appendFootnotesToData = require("./footnotes.js").appendFootnotesToData;

const formatLocale = d3.format.formatLocale({
  decimal: ",",
  thousands: " ", // this is a viertelgeviert U+2005
  grouping: [3]
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

module.exports = {
  getTableData: getTableData,
  getNumericColumns: getNumericColumns,
  isNumeric: isNumeric
};

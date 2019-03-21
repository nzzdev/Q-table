const clone = require("clone");
const d3 = {
  format: require("d3-format")
};
const appendFootnoteAnnotationsToTableData = require("./footnotes.js")
  .appendFootnoteAnnotationsToTableData;

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

function getColumnsType(data) {
  const columns = [];
  const table = clone(data).slice(1);
  let isColumnNumeric = false;
  // go through every column of table
  for (var i = 0; i <= table[0].length; i++) {
    for (let row of table) {
      if (
        isNumeric(row[i]) === true ||
        row[i] === null ||
        row[i] === "" ||
        row[i] === "-"
      ) {
        // if the cell is empty or is a hyphen(-), we treat it as potentially numeric here
        isColumnNumeric = true;
      } else {
        isColumnNumeric = false;
        break;
      }
    }
    columns.push({ isNumeric: isColumnNumeric });
  }
  return columns;
}

function getNumericColumns(data) {
  const columns = getColumnsType(data);
  const numericColumns = [];
  // data[0].length is undefined when creating a new item
  if (data[0] !== undefined) {
    for (var i = 0; i <= data[0].length; i++) {
      if (columns[i].isNumeric) {
        numericColumns.push({ title: data[0][i], index: i });
      }
    }
  }
  return numericColumns;
}

function getTableData(data, footnotes, options) {
  const columns = getColumnsType(data);
  let tableData = data.map((row, rowIndex) => {
    return row.map((cell, columnIndex) => {
      let type = "text";
      let value = cell;
      if (columns[columnIndex].isNumeric) {
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
        value: value,
        classes: []
      };
    });
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

module.exports = {
  getTableData: getTableData,
  getNumericColumns: getNumericColumns,
  isNumeric: isNumeric
};

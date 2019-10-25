const clone = require("clone");
const d3 = {
  format: require("d3-format")
};
const Array2D = require("array2d");
const appendFootnoteAnnotationsToTableData = require("./footnotes.js")
  .appendFootnoteAnnotationsToTableData;

const formatLocale = d3.format.formatLocale({
  decimal: ",",
  thousands: " ", // this is a viertelgeviert U+2005,
  minus: "–", // this is a em-dash U+2013
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

  Array2D.eachColumn(table, column => {
    let columnEmpty = column.every(cell => {
      return cell === null || cell === "" || cell === "-" || cell === "–";
    });
    let isColumnNumeric = column.every(cell => {
      return (
        !columnEmpty &&
        (isNumeric(cell) ||
          cell === null ||
          cell === "" ||
          cell === "-" ||
          cell === "–")
      );
    });
    columns.push({ isNumeric: isColumnNumeric });
  });
  return columns;
}

function getNumericColumns(data) {
  const columns = getColumnsType(data);
  const numericColumns = [];
  // data[0].length is undefined when creating a new item
  if (data[0] !== undefined) {
    Array2D.forRow(data, 0, (cell, rowIndex, columnIndex) => {
      if (columns[columnIndex].isNumeric) {
        numericColumns.push({ title: cell, index: columnIndex });
      }
    });
  }
  return numericColumns;
}

function getTableData(data, footnotes, options) {
  const columns = getColumnsType(data);
  let tableData = [];
  Array2D.eachRow(data, (row, rowIndex) => {
    let cells = row.map((cell, columnIndex) => {
      let type = "text";
      let value = cell;
      if (columns[columnIndex].isNumeric) {
        type = "numeric";
        // do not format the header row, empty cells, a hyphen(-) or a dash (–)
        if (
          rowIndex > 0 &&
          cell !== null &&
          cell !== "" &&
          cell != "-" &&
          cell != "–"
        ) {
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

module.exports = {
  getTableData: getTableData,
  getNumericColumns: getNumericColumns,
  isNumeric: isNumeric
};

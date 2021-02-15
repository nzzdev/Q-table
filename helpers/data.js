const clone = require("clone");
const d3 = {
  format: require("d3-format")
};
const Array2D = require("array2d");
const appendFootnoteAnnotationsToTableData = require("./footnotes.js")
  .appendFootnoteAnnotationsToTableData;

const fourPerEmSpace = "\u2005";
const enDash = "\u2013";

const formatLocale = d3.format.formatLocale({
  decimal: ",",
  thousands: fourPerEmSpace,
  minus: enDash,
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
    let withFormating = false;
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
    if (isColumnNumeric) {
      const numbersOfColumn = column.map(number => isNumeric(number) ? parseFloat(number) : null);
      withFormating = Math.max(...numbersOfColumn) >= 10000 || Math.min(...numbersOfColumn) <= -10000
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
      let classes = [];
      if (columns[columnIndex].isNumeric) {
        type = "numeric";
        classes.push('s-font-note--tabularnums');

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
        classes: classes
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

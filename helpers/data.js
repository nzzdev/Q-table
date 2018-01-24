const clone = require("clone");
const d3 = {
  format: require("d3-format")
};

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
      row[columnIndex] === ""
    ) {
      // if the cell is empty, we treat it as potentially numeric here
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
        // do not format the header row or empty cells
        if (rowIndex > 0 && cell !== null && cell !== "") {
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

module.exports = {
  getDataForTemplate: getDataForTemplate
};

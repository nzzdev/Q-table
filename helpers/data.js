const clone = require('clone');
const d3 = {
  format: require('d3-format')
}

d3.format.formatDefaultLocale({
  "decimal": ".",
  "thousands": "'",
  "grouping": [3]
});

const formatNumber = d3.format.format(',');

function isNumeric(cell) {
  if (!cell) {
    return false;
  }
  // if there is more than one dot it is probably a date and not a number
  if ((cell.match(/\./g) || []).length > 1) {
     return false;
  }
  // if there is - in the data, it's not a number
  if ((cell.match(/\-/g) || []).length > 0) {
    return false;
 }
  return (cell && !Number.isNaN(parseFloat(cell)));
}

function isColumnNumeric(data, columnIndex) {
  let isColumnNumeric = false;
  for (let row of clone(data).slice(1)) {
    if (isNumeric(row[columnIndex]) || row[columnIndex] === null || row[columnIndex] === '') { // if the cell is empty, we treat it as potentially numeric here
      isColumnNumeric = true;
    } else {
      return false;
    }
  };
  return isColumnNumeric;
}

function getDataForTemplate(data) {
  return data
    .map((row, index) => {
      return row
        .map((cell, columnIndex) => {
          let type = 'text';
          let value = cell;
          if (isColumnNumeric(data, columnIndex)) {
            type = 'numeric';
          }
          if (isNumeric(cell) && cell.length > 4) { // format like 100'000 if the number is more than 4 digits long (no years)
            value = formatNumber(cell);
          }
          return {
            type: type,
            value: value
          };
        })
    })
}

module.exports = {
  getDataForTemplate: getDataForTemplate
};

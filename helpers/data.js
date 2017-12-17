const clone = require('clone');

function isNumeric(cell) {
  return (cell && !Number.isNaN(parseFloat(cell)));
}

function isColumnNumeric(data, columnIndex) {
  let isColumnNumeric = false;
  for (let row of clone(data).slice(1)) {
    if (isNumeric(row[columnIndex]) || row[columnIndex] === '') { // if the cell is empty, we treat it as potentially numeric here
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
      // handle the header row differently
      if (index === 0) {
        return row
          .map((cell, columnIndex) => {
            let type = 'text';
            if (isColumnNumeric(data, columnIndex)) {
              type = 'numeric';
            }
            return {
              value: cell,
              type: type
            };
          });
      }
      // all data rows
      return row
        .map(cell => {
          let type = 'text';
          if (isNumeric(cell)) {
            type = 'numeric';
          }
          return {
            type: type,
            value: cell
          };
        })
    })
}

module.exports = {
  getDataForTemplate: getDataForTemplate
};

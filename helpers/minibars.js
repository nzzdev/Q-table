const clone = require("clone");
const isNumeric = require("./data.js").isNumeric;

const miniBarTypes = {
  positive: "positive",
  negative: "negative",
  mixed: "mixed",
  empty: "empty"
};

function getMinibarNumbersWithType(data, selectedColumnIndex) {
  let minibarsWithType = {
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
      minibarsWithType.numbers.push(parseFloat(value));
      minibarsWithType.items.push({ value: parseFloat(value), type });
    } else {
      minibarsWithType.items.push({ value: null, type });
    }
  });

  minibarsWithType.type = getMinibarType(typeAmount);
  return minibarsWithType;
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

function getMinibarData(data, selectedColumnIndex) {
  let dataColumn = getMinibarNumbersWithType(data, selectedColumnIndex);
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
  getMinibarNumbersWithType: getMinibarNumbersWithType,
  getMinibarData: getMinibarData
};

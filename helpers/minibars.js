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

function getMinibarContext(options, itemDataCopy) {
  let minibar = {};
  // if minibars active
  if (options.minibar !== null && options.minibar !== undefined) {
    if (
      options.minibar.selectedColumn !== null &&
      options.minibar.selectedColumn !== undefined
    ) {
      // get minibar
      minibar = getMinibarData(itemDataCopy, options.minibar);
      if (
        minibar.barColor.positive.className === "" &&
        minibar.barColor.positive.colorCode === ""
      ) {
        minibar.barColor.positive.className = getPositiveColor(minibar.type);
      } else if (minibar.barColor.positive.className !== "") {
        minibar.barColor.positive.colorCode = "";
      }

      if (
        minibar.barColor.negative.className === "" &&
        minibar.barColor.negative.colorCode === ""
      ) {
        minibar.barColor.negative.className = getNegativeColor(minibar.type);
      } else if (minibar.barColor.negative.className !== "") {
        minibar.barColor.negative.colorCode = "";
      }

      if (options.minibar.invertColors) {
        let color = minibar.barColor.negative;
        minibar.barColor.negative = minibar.barColor.positive;
        minibar.barColor.positive = color;
      }
    }
  }
  return minibar;
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

function getMinibarData(data, minibarOptions) {
  let dataColumn = getMinibarNumbersWithType(
    data,
    minibarOptions.selectedColumn
  );
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
    type: dataColumn.type,
    barColor: minibarOptions.barColor
  };
}

function getPositiveColor(type) {
  let color;
  if (type === "mixed") {
    color = "s-viz-color-diverging-2-2";
  } else {
    color = "s-viz-color-one-5";
  }
  return color;
}

function getNegativeColor(type) {
  let color;
  if (type === "mixed") {
    color = "s-viz-color-diverging-2-1";
  } else {
    color = "s-viz-color-one-5";
  }
  return color;
}

module.exports = {
  getMinibarNumbersWithType: getMinibarNumbersWithType,
  getMinibarContext: getMinibarContext
};

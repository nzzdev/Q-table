var clone = require("clone");
var isNumeric = require("./data.js").isNumeric;
var Array2D = require("array2d");
var miniBarTypes = {
    positive: "positive",
    negative: "negative",
    mixed: "mixed",
    empty: "empty"
};
function getMinibarNumbersWithType(data, selectedColumnIndex) {
    var minibarsWithType = {
        items: [],
        numbers: []
    };
    var dataCopy = clone(data);
    dataCopy[0] = dataCopy[0].map(function (cell) { return (cell = ""); }); // first row is always header so ignore it
    Array2D.forColumn(dataCopy, selectedColumnIndex, function (cell) {
        var type = miniBarTypes.positive;
        if (cell < 0) {
            type = miniBarTypes.negative;
        }
        else if (cell > 0) {
            type = miniBarTypes.positive;
        }
        else {
            type = miniBarTypes.empty;
        }
        if (isNumeric(cell) || parseFloat(cell)) {
            minibarsWithType.numbers.push(parseFloat(cell));
            minibarsWithType.items.push({ value: parseFloat(cell), type: type });
        }
        else {
            minibarsWithType.items.push({ value: null, type: type });
        }
    });
    minibarsWithType.type = getMinibarType(minibarsWithType.numbers);
    return minibarsWithType;
}
function getMinibarContext(options, itemDataCopy) {
    var minibar = {};
    // if minibars active
    if (options.minibar !== null && options.minibar !== undefined) {
        if (options.minibar.selectedColumn !== null &&
            options.minibar.selectedColumn !== undefined) {
            // get minibar
            minibar = getMinibarData(itemDataCopy, options.minibar);
            if (minibar.barColor.positive.className === "" &&
                minibar.barColor.positive.colorCode === "") {
                minibar.barColor.positive.className = getPositiveColor(minibar.type);
            }
            else if (minibar.barColor.positive.className !== "") {
                minibar.barColor.positive.colorCode = "";
            }
            if (minibar.barColor.negative.className === "" &&
                minibar.barColor.negative.colorCode === "") {
                minibar.barColor.negative.className = getNegativeColor(minibar.type);
            }
            else if (minibar.barColor.negative.className !== "") {
                minibar.barColor.negative.colorCode = "";
            }
            if (options.minibar.invertColors) {
                var color = minibar.barColor.negative;
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
    }
    else if (type === miniBarTypes.negative) {
        return Math.abs((value * 100) / min);
    }
    else {
        return Math.abs((value * 100) / Math.max(Math.abs(min), Math.abs(max))) / 2; // divided by 2 because max. value is 50%
    }
}
function getMinibarType(numbers) {
    if (numbers.every(function (number) { return number > 0; })) {
        return miniBarTypes.positive;
    }
    else if (numbers.every(function (number) { return number < 0; })) {
        return miniBarTypes.negative;
    }
    else {
        return miniBarTypes.mixed;
    }
}
function getMinibarData(data, minibarOptions) {
    var dataColumn = getMinibarNumbersWithType(data, minibarOptions.selectedColumn);
    var minValue = Math.min.apply(Math, dataColumn.numbers);
    var maxValue = Math.max.apply(Math, dataColumn.numbers);
    var values = dataColumn.items.map(function (item) {
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
    var color;
    if (type === "mixed") {
        color = "s-viz-color-diverging-2-2";
    }
    else {
        color = "s-viz-color-one-5";
    }
    return color;
}
function getNegativeColor(type) {
    var color;
    if (type === "mixed") {
        color = "s-viz-color-diverging-2-1";
    }
    else {
        color = "s-viz-color-one-5";
    }
    return color;
}
module.exports = {
    getMinibarNumbersWithType: getMinibarNumbersWithType,
    getMinibarContext: getMinibarContext
};

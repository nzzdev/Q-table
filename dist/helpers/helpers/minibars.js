import clone from 'clone';
import { isNumeric } from './data.js';
import Array2D from 'array2d';
const miniBarTypes = {
    positive: "positive",
    negative: "negative",
    mixed: "mixed",
    empty: "empty"
};
export function getMinibarNumbersWithType(data, selectedColumnIndex) {
    let minibarsWithType = {
        items: [],
        numbers: []
    };
    let dataCopy = clone(data);
    dataCopy[0] = dataCopy[0].map(cell => (cell = "")); // first row is always header so ignore it
    Array2D.forColumn(dataCopy, selectedColumnIndex, cell => {
        let type = miniBarTypes.positive;
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
            minibarsWithType.items.push({ value: parseFloat(cell), type });
        }
        else {
            minibarsWithType.items.push({ value: null, type });
        }
    });
    minibarsWithType.type = getMinibarType(minibarsWithType.numbers);
    return minibarsWithType;
}
export function getMinibarContext(options, itemDataCopy) {
    let minibar = {};
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
    }
    else if (type === miniBarTypes.negative) {
        return Math.abs((value * 100) / min);
    }
    else {
        return Math.abs((value * 100) / Math.max(Math.abs(min), Math.abs(max))) / 2; // divided by 2 because max. value is 50%
    }
}
function getMinibarType(numbers) {
    if (numbers.every(number => { return number > 0; })) {
        return miniBarTypes.positive;
    }
    else if (numbers.every(number => { return number < 0; })) {
        return miniBarTypes.negative;
    }
    else {
        return miniBarTypes.mixed;
    }
}
function getMinibarData(data, minibarOptions) {
    let dataColumn = getMinibarNumbersWithType(data, minibarOptions.selectedColumn);
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
    }
    else {
        color = "s-viz-color-one-5";
    }
    return color;
}
function getNegativeColor(type) {
    let color;
    if (type === "mixed") {
        color = "s-viz-color-diverging-2-1";
    }
    else {
        color = "s-viz-color-one-5";
    }
    return color;
}

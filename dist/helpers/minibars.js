export function getMinibar(minibarsAvailable, options, itemDataCopy) {
    var _a;
    if (minibarsAvailable === true && typeof ((_a = options.minibar) === null || _a === void 0 ? void 0 : _a.selectedColumn) === 'number') {
        const minibarSettings = options.minibar;
        const minibar = createMinibarObject(itemDataCopy, minibarSettings);
        checkPositiveBarColor(minibar);
        checkNegativeBarColor(minibar);
        if (minibarSettings.invertColors) {
            invertBarColors(minibar);
        }
        return minibar;
    }
    return null;
}
export function getMinibarNumbersWithType(data, selectedColumnIndex) {
    let minibarsWithType = {
        items: [],
        numbers: [],
        type: "mixed" /* MINIBAR_TYPE.MIXED */,
    };
    // First row is always header so we add a null entry for it.
    minibarsWithType.items.push({
        value: null,
        type: "empty" /* MINIBAR_TYPE.EMPTY */
    });
    // First row is always header so start at 1.
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const cell = row[selectedColumnIndex];
        let value = parseFloat(cell || '');
        const type = getTypeOfValue(value);
        if (isNaN(value)) {
            minibarsWithType.items.push({
                value: null,
                type
            });
        }
        else {
            minibarsWithType.numbers.push(value);
            minibarsWithType.items.push({
                value,
                type
            });
        }
    }
    minibarsWithType.type = getMinibarType(minibarsWithType.numbers);
    return minibarsWithType;
}
/**
 * Internal.
 */
function createMinibarObject(data, minibarOptions) {
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
function getMinibarValue(type, value, min, max) {
    if (value === null)
        return 0;
    switch (type) {
        case "positive" /* MINIBAR_TYPE.POSITIVE */:
            return Math.abs((value * 100) / max);
        case "negative" /* MINIBAR_TYPE.NEGATIVE */:
            return Math.abs((value * 100) / min);
        default:
            return Math.abs((value * 100) / Math.max(Math.abs(min), Math.abs(max))) / 2;
    }
}
function checkPositiveBarColor(minibar) {
    const className = minibar.barColor.positive.className;
    const colorCode = minibar.barColor.positive.colorCode;
    if (className === '' && colorCode === '') {
        minibar.barColor.positive.className = getPositiveColor(minibar.type);
    }
    else if (className !== '') {
        minibar.barColor.positive.colorCode = '';
    }
}
function checkNegativeBarColor(minibar) {
    const className = minibar.barColor.negative.className;
    const colorCode = minibar.barColor.negative.colorCode;
    if (className === '' && colorCode === '') {
        minibar.barColor.negative.className = getNegativeColor(minibar.type);
    }
    else if (className !== '') {
        minibar.barColor.negative.colorCode = '';
    }
}
function invertBarColors(minibar) {
    let temp = minibar.barColor.negative;
    minibar.barColor.negative = minibar.barColor.positive;
    minibar.barColor.positive = temp;
}
function getTypeOfValue(value) {
    if (value < 0) {
        return "negative" /* MINIBAR_TYPE.NEGATIVE */;
    }
    if (value > 0) {
        return "positive" /* MINIBAR_TYPE.POSITIVE */;
    }
    return "empty" /* MINIBAR_TYPE.EMPTY */;
}
function getMinibarType(numbers) {
    const allPositive = numbers.every(number => number > 0);
    const allNegative = numbers.every(number => number < 0);
    if (allPositive) {
        return "positive" /* MINIBAR_TYPE.POSITIVE */;
    }
    else if (allNegative) {
        return "negative" /* MINIBAR_TYPE.NEGATIVE */;
    }
    return "mixed" /* MINIBAR_TYPE.MIXED */;
}
function getPositiveColor(type) {
    let color;
    if (type === 'mixed') {
        color = 's-viz-color-diverging-2-2';
    }
    else {
        color = 's-viz-color-one-5';
    }
    return color;
}
function getNegativeColor(type) {
    let color;
    if (type === 'mixed') {
        color = 's-viz-color-diverging-2-1';
    }
    else {
        color = 's-viz-color-one-5';
    }
    return color;
}

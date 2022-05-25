var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var dataHelpers = require("./data.js");
var legendHelpers = require("./colorColumnLegend.js");
var colorHelpers = require("./colorColumnColor.js");
var methodBoxHelpers = require("./colorColomnMethodBox.js");
function hasCustomBuckets(bucketType) {
    return bucketType === "custom";
}
function getNumberBuckets(colorColumn) {
    try {
        if (colorColumn.numericalOptions.bucketType !== "custom") {
            return colorColumn.numericalOptions.numberBuckets;
        }
        else {
            var bucketBorderValues = dataHelpers.getCustomBucketBorders(colorColumn.numericalOptions.customBuckets);
            return bucketBorderValues.length - 1; // min value is part of border values and has to be excluded here
        }
    }
    catch (_a) {
        return 0;
    }
}
function getColorColumnContext(colorColumn, data, width) {
    var colorColumnContext = {};
    if (colorColumn !== null &&
        colorColumn !== undefined &&
        colorColumn.selectedColumn !== null &&
        colorColumn.selectedColumn !== undefined) {
        var colors_1 = [];
        if (colorColumn.colorColumnType === "numerical") {
            var formattingOptions_1 = {
                maxDigitsAfterComma: dataHelpers.getMaxDigitsAfterCommaInDataByRow(data, colorColumn.selectedColumn),
                roundingBucketBorders: colorColumn.numericalOptions.bucketType !== "custom"
            };
            colorColumnContext.legendData = legendHelpers.getNumericalLegend(data, colorColumn, formattingOptions_1.maxDigitsAfterComma, width);
            colorColumnContext.methodBox = methodBoxHelpers.getMethodBoxInfo(colorColumn.numericalOptions.bucketType);
            var valuesByColumn = dataHelpers.getNumericalValuesByColumn(data, colorColumn.selectedColumn);
            colorColumnContext.formattedValues = [];
            colorColumnContext.methodBox.formattedBuckets =
                dataHelpers.getFormattedBuckets(formattingOptions_1, colorColumnContext.legendData.buckets);
            valuesByColumn.map(function (value) {
                var color = colorHelpers.getColor(value, colorColumnContext.legendData);
                colors_1 = __spreadArray(__spreadArray([], colors_1, true), [color], false);
                colorColumnContext.formattedValues = __spreadArray(__spreadArray([], colorColumnContext.formattedValues, true), [
                    dataHelpers.getFormattedValue(formattingOptions_1, value),
                ], false);
            });
        }
        else {
            colorColumnContext.legendData = legendHelpers.getCategoricalLegend(data, colorColumn);
            var categoriesByColumn = dataHelpers.getCategoricalValuesByColumn(data, colorColumn.selectedColumn);
            categoriesByColumn.map(function (category) {
                var color = colorHelpers.getColor(category, colorColumnContext.legendData);
                colors_1 = __spreadArray(__spreadArray([], colors_1, true), [color], false);
            });
        }
        colorColumnContext = __assign(__assign(__assign({}, colorColumnContext), colorColumn), { colors: colors_1 });
    }
    return colorColumnContext;
}
module.exports = {
    getNumberBuckets: getNumberBuckets,
    hasCustomBuckets: hasCustomBuckets,
    getColorColumnContext: getColorColumnContext
};

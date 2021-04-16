const dataHelpers = require("./data.js");
const legendHelpers = require("./colorColumnLegend.js");
const colorHelpers = require("./colorColumnColor.js");
const methodBoxHelpers = require("./colorColomnMethodBox.js");

function hasCustomBuckets(bucketType) {
    return bucketType === "custom";
}

function getCustomBucketBorders(customBuckets) {
    const customBorderStrings = customBuckets.split(",");
    return customBorderStrings.map((borderValue) => {
        return parseFloat(borderValue.trim());
    });
}

function getNumberBuckets(colorColumn) {
    try {
        if (colorColumn.numericalOptions.bucketType !== "custom") {
            return colorColumn.numericalOptions.numberBuckets;
        } else {
            const bucketBorderValues = getCustomBucketBorders(
                colorColumn.numericalOptions.customBuckets
            );
            return bucketBorderValues.length - 1; // min value is part of border values and has to be excluded here
        }
    } catch {
        return 0;
    }
}

function getColorColumnContext(colorColumn, data) {
    let colorColumnContext = {};
    if (colorColumn !== null && colorColumn !== undefined && colorColumn.selectedColumn !== null && colorColumn.selectedColumn !== undefined) {
        let colors = [];
        if (colorColumn.colorColumnType === "numerical") {
            colorColumnContext.legendData = legendHelpers.getNumericalLegend(
                data,
                colorColumn
            );

            let formattingOptions = {
                maxDigitsAfterComma: dataHelpers.getMaxDigitsAfterCommaInDataByRow(
                    data, colorColumn.selectedColumn
                ),
                roundingBucketBorders: colorColumn.numericalOptions.bucketType !== "custom"
            };

            colorColumnContext.methodBox = methodBoxHelpers.getMethodBoxInfo(
                colorColumn.numericalOptions.bucketType
            );

            let valuesByColumn = dataHelpers.getNumericalValuesByColumn(data, colorColumn.selectedColumn);
            colorColumnContext.formattedValues = [];
            colorColumnContext.methodBox.formattedValues = [];
            valuesByColumn.map(value => {
                let color = colorHelpers.getColor(value, colorColumnContext.legendData);
                colors = [...colors, color];
                colorColumnContext.formattedValues = [...colorColumnContext.formattedValues, dataHelpers.getFormattedValue(formattingOptions, value)];
                colorColumnContext.methodBox.formattedValues = [...colorColumnContext.methodBox.formattedValues, dataHelpers.getFormattedValueForBuckets(formattingOptions, value)];
            })
        } else {
            colorColumnContext.legendData = legendHelpers.getCategoricalLegend(
                data,
                colorColumn
            );

            let categoriesByColumn = dataHelpers.getCategoricalValuesByColumn(data, colorColumn.selectedColumn);
            categoriesByColumn.map(category => {
                let color = colorHelpers.getColor(category, colorColumnContext.legendData);
                colors = [...colors, color];
            });
        }
        colorColumnContext = { ...colorColumnContext, ...colorColumn, colors };
    }
    return colorColumnContext;
}


module.exports = {
    getCustomBucketBorders,
    getNumberBuckets,
    hasCustomBuckets,
    getColorColumnContext,
};
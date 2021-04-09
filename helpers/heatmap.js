const dataHelpers = require("./data.js");
const legendHelpers = require("./heatmapLegend.js");
const colorHelpers = require("./heatmapColor.js");
const methodBoxHelpers = require("./heatmapMethodBox.js");

function hasCustomBuckets(bucketType) {
    return bucketType === "custom";
}

function getCustomBucketBorders(customBuckets) {
    const customBorderStrings = customBuckets.split(",");
    return customBorderStrings.map((borderValue) => {
        return parseFloat(borderValue.trim());
    });
}

function getNumberBuckets(heatmap) {
    try {
        if (heatmap.numericalOptions.bucketType !== "custom") {
            return heatmap.numericalOptions.numberBuckets;
        } else {
            const bucketBorderValues = getCustomBucketBorders(
                heatmap.numericalOptions.customBuckets
            );
            return bucketBorderValues.length - 1; // min value is part of border values and has to be excluded here
        }
    } catch {
        return 0;
    }
}

function getHeatmapContext(heatmap, data) {
    try {
        let heatmapContext = {};
        if (heatmap !== null && heatmap !== undefined && heatmap.selectedColumn !== null && heatmap.selectedColumn !== undefined) {
            let colors = [];
            if (heatmap.heatmapType === "numerical") {
                heatmapContext.legendData = legendHelpers.getNumericalLegend(
                    data,
                    heatmap
                );

                console.log('----')
                console.log('legendData:')
                console.table(heatmapContext.legendData);


                let formattingOptions = {
                    maxDigitsAfterComma: dataHelpers.getMaxDigitsAfterCommaInDataByRow(
                        data, heatmap.selectedColumn
                    ),
                    roundingBucketBorders: heatmap.numericalOptions.bucketType !== "custom"
                };

                heatmapContext.methodBox = methodBoxHelpers.getMethodBoxInfo(
                    heatmap.numericalOptions.bucketType
                );

                console.log('----')
                console.log('methodBox:')
                console.table(heatmapContext.methodBox);


                let valuesByColumn = dataHelpers.getNumericalValuesByColumn(data, heatmap.selectedColumn);
                heatmapContext.formattedValues = [];
                heatmapContext.methodBox.formattedValues = [];
                valuesByColumn.map(value => {
                    let color = colorHelpers.getColor(value, heatmapContext.legendData);
                    colors = [...colors, color];
                    heatmapContext.formattedValues = [...heatmapContext.formattedValues, dataHelpers.getFormattedValue(formattingOptions, value)];
                    heatmapContext.methodBox.formattedValues = [...heatmapContext.methodBox.formattedValues, dataHelpers.getFormattedValueForBuckets(formattingOptions, value)];
                })
                console.log('----')
                console.log('formattedValues:')
                console.table(heatmapContext.formattedValues);

            } else {
                heatmapContext.legendData = legendHelpers.getCategoricalLegend(
                    data,
                    heatmap
                );

                let categoriesByColumn = dataHelpers.getCategoricalValuesByColumn(data, heatmap.selectedColumn);
                categoriesByColumn.map(category => {
                    let color = colorHelpers.getColor(category, heatmapContext.legendData);
                    colors = [...colors, color];
                });
            }
            console.log('----')
            console.log('heatmapContext:')
            console.table(heatmapContext);
            heatmapContext = { ...heatmapContext, ...heatmap, colors };
        }
        console.log('successfully return heatmapContexty');
        return heatmapContext;
    } catch (ex) {
        console.log(ex);
    }
}


module.exports = {
    getCustomBucketBorders,
    getNumberBuckets,
    hasCustomBuckets,
    getHeatmapContext,
};
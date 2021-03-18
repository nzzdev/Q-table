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
    let heatmapContext = {};
    if (heatmap !== null && heatmap !== undefined && heatmap.selectedColumn !== null && heatmap.selectedColumn !== undefined) {
        let colors = [];
        if (heatmap.heatmapType === "numerical") {
            heatmapContext.legendData = legendHelpers.getNumericalLegend(
                data,
                heatmap
            );

            heatmapContext.methodBox = methodBoxHelpers.getMethodBoxInfo(
                heatmap.numericalOptions.bucketType
            );

            let valuesByColumn = dataHelpers.getNumericalValuesByColumn(data, heatmap.selectedColumn);
            valuesByColumn.map((val, index) => {
                let color = colorHelpers.getColor(index, heatmapContext.legendData);
                colors = [...colors, color];
            })
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
        heatmapContext = { ...heatmap, colors };
    }
    return heatmapContext;
}


module.exports = {
    getCustomBucketBorders,
    getNumberBuckets,
    hasCustomBuckets,
    getHeatmapContext,
};
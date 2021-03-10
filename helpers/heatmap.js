const clone = require("clone");
const array2d = require("array2d");
const dataHelpers = require("./data.js");
const legendHelpers = require("./heatmapLegend.js");
const colorHelpers = require("./heatmapColor.js");

function hasCustomBuckets(bucketType) {
    return bucketType === "custom";
}

function getUniqueCategoriesCount(data) {
    return getUniqueCategoriesObject(data).categories.length;
}

function getUniqueCategoriesObject(data, customCategoriesOrder) {
    let hasNullValues = false;
    const values = data
        .map((row) => {
            return row[1];
        })
        .filter((value) => {
            if (value !== null && value !== "") {
                return true;
            }
            hasNullValues = true;
            return false;
        });
    let sortedValues = getSortedValues(values);

    // If the user has set a custom order, sort the categories accordingly
    if (customCategoriesOrder) {
        sortedValues.sort(
            function (a, b) {
                return customCategoriesOrder.map(c => c.category).indexOf(a) -
                    customCategoriesOrder.map(c => c.category).indexOf(b);
            });
    }

    return { hasNullValues, categories: [...new Set(sortedValues)] };
}

function getCustomBucketBorders(customBuckets) {
    const customBorderStrings = customBuckets.split(",");
    return customBorderStrings.map((borderValue) => {
        return parseFloat(borderValue.trim());
    });
}

function getNumberBuckets(heatmap) {
    try {
        if (heatmap.bucketType !== "custom") {
            return heatmap.numberBuckets;
        } else {
            const bucketBorderValues = getCustomBucketBorders(
                heatmap.customBuckets
            );
            return bucketBorderValues.length - 1; // min value is part of border values and has to be excluded here
        }
    } catch {
        return 0;
    }
}

function getHeatmapContext(heatmap, data) {
    if (heatmap !== null && heatmap !== undefined && heatmap.selectedColumn !== null && heatmap.selectedColumn !== undefined) {
        let colors = [];
        let legendData = legendHelpers.getHeatmapLegend(data, heatmap);
        let valuesByRow = dataHelpers.getNumericalValuesByColumn(data, heatmap.selectedColumn)
        valuesByRow.map(value => {
            let color = colorHelpers.getColor(value, legendData);
            colors = [...colors, color];
        })
        return { ...colors }
    }
    return {}; // return empty object when option not selected
}

module.exports = {
    getCustomBucketBorders,
    getNumberBuckets,
    hasCustomBuckets,
    getUniqueCategoriesObject,
    getUniqueCategoriesCount,
    getHeatmapContext,
};
const clone = require("clone");
const array2d = require("array2d");
const dataHelpers = require("./data.js");
const legendHelpers = require("./heatmapLegend.js");

function hasCustomBuckets(bucketType) {
    return bucketType === "custom";
}

function getDataWithoutHeaderRow(data) {
    return data.slice(1);
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


function getHeatmapContext(options, data) {
    let heatmap = {};
    let heatmapLegend = {};
    if (options.heatmap !== null && options.heatmap !== undefined) {
        heatmapLegend = legendHelpers.getHeatmapLegend(data, options.heatmap)
    }
    return heatmapLegend;
}

module.exports = {
    getDataWithoutHeaderRow,
    getCustomBucketBorders,
    getNumberBuckets,
    hasCustomBuckets,
    getUniqueCategoriesObject,
    getUniqueCategoriesCount,
    getHeatmapContext,
};
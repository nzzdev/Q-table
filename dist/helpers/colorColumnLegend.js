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
var dataHelpers = require("./data.js");
var colorHelpers = require("./colorColumnColor.js");
var simpleStatistics = require("simple-statistics");
var ckmeans = simpleStatistics.ckmeans;
var quantile = simpleStatistics.quantile;
var widthConfig = {
    legendSmall: 640,
    legendLarge: 100,
    average: 100,
    median: 60
};
function getBucketsForLegend(filteredValues, colorColumn, minValue, maxValue, customColorMap, maxDigitsAfterComma) {
    var bucketType = colorColumn.numericalOptions.bucketType;
    var numberBuckets = colorColumn.numericalOptions.numberBuckets;
    var scale = colorColumn.numericalOptions.scale;
    var colorOptions = {
        colorScheme: colorColumn.numericalOptions.colorScheme,
        colorOverwrites: customColorMap
    };
    if (bucketType === "ckmeans") {
        return getCkMeansBuckets(filteredValues, numberBuckets, scale, colorOptions);
    }
    else if (bucketType === "quantile") {
        return getQuantileBuckets(filteredValues, numberBuckets, minValue, scale, colorOptions);
    }
    else if (bucketType === "equal") {
        return getEqualBuckets(numberBuckets, minValue, maxValue, scale, colorOptions, maxDigitsAfterComma);
    }
    else if (bucketType === "custom") {
        return getCustomBuckets(colorColumn, scale, colorOptions);
    }
    return [];
}
function getCkMeansBuckets(filteredValues, numberBuckets, scale, colorOptions) {
    var ckmeansBuckets = ckmeans(filteredValues, numberBuckets);
    return ckmeansBuckets.map(function (bucket, index) {
        var from = index === 0
            ? Math.min.apply(Math, bucket) : Math.max.apply(Math, ckmeansBuckets[index - 1]);
        var to = Math.max.apply(Math, bucket);
        return {
            from: from,
            to: to,
            color: colorHelpers.getBucketColor(numberBuckets, index, scale, colorOptions)
        };
    });
}
function getQuantileBuckets(filteredValues, numberBuckets, minValue, scale, colorOptions) {
    var quantilePortion = 1 / numberBuckets;
    var quantiles = [];
    for (var i = 1; i <= numberBuckets; i++) {
        quantiles.push(i * quantilePortion);
    }
    var quantileUpperBorders = quantile(filteredValues, quantiles);
    return quantileUpperBorders.map(function (quantileBorder, index) {
        var from = index === 0 ? minValue : quantileUpperBorders[index - 1];
        return {
            from: from,
            to: quantileBorder,
            color: colorHelpers.getBucketColor(numberBuckets, index, scale, colorOptions)
        };
    });
}
function getEqualBuckets(numberBuckets, minValue, maxValue, scale, colorOptions, maxDigitsAfterComma) {
    var portion = 1 / numberBuckets;
    var range = maxValue - minValue;
    var equalBuckets = [];
    for (var i = 0; i < numberBuckets; i++) {
        var from = i === 0 ? minValue : minValue + range * portion * i;
        var to = minValue + range * portion * (i + 1);
        // round numbers
        var roundingFactor = Math.pow(10, maxDigitsAfterComma);
        from = Math.round(from * roundingFactor) / roundingFactor;
        to = Math.round(to * roundingFactor) / roundingFactor;
        equalBuckets.push({
            from: from,
            to: to,
            color: colorHelpers.getBucketColor(numberBuckets, i, scale, colorOptions)
        });
    }
    return equalBuckets;
}
function getCustomBuckets(colorColumn, scale, colorOptions) {
    if (colorColumn.numericalOptions.customBuckets !== undefined) {
        var customBorderValues_1 = dataHelpers.getCustomBucketBorders(colorColumn.numericalOptions.customBuckets);
        var numberBuckets_1 = customBorderValues_1.length - 1;
        var minBorder_1 = customBorderValues_1.shift();
        var customBuckets_1 = [];
        customBorderValues_1.forEach(function (borderValue, index) {
            customBuckets_1.push({
                from: index === 0 ? minBorder_1 : customBorderValues_1[index - 1],
                to: borderValue,
                color: colorHelpers.getBucketColor(numberBuckets_1, index, scale, colorOptions)
            });
        });
        return customBuckets_1;
    }
}
function hasSingleValueBucket(legendData) {
    var firstBucket = legendData.buckets[0];
    return firstBucket.from === firstBucket.to;
}
function getNumericalLegend(data, colorColumn, maxDigitsAfterComma, width) {
    var customColorMap = colorHelpers.getCustomColorMap(colorColumn.numericalOptions.colorOverwrites);
    var values = dataHelpers.getNumericalValuesByColumn(data, colorColumn.selectedColumn);
    var nonNullValues = dataHelpers.getNonNullValues(values);
    var metaData = dataHelpers.getMetaData(values, nonNullValues, maxDigitsAfterComma);
    var legendData = __assign({ type: "numerical", labelLegend: colorColumn.numericalOptions.labelLegend }, metaData);
    legendData.buckets = getBucketsForLegend(nonNullValues, colorColumn, legendData.minValue, legendData.maxValue, customColorMap, maxDigitsAfterComma);
    legendData.labelLegend = getLabelLegend(legendData, maxDigitsAfterComma);
    if (legendData.labelLegend.value) {
        legendData.labelLegend.descriptionAlignment = getDescriptionAlignment(legendData.labelLegend, width, maxDigitsAfterComma);
    }
    legendData.hasSingleValueBucket = hasSingleValueBucket(legendData);
    // for all bucket types we calculate the resulting buckets out of given data set
    // custom bucketing need a special handling of min/max values because the first and the last
    // custom bucket value could be lower/higher than min/max
    if (colorColumn.numericalOptions.bucketType === "custom") {
        // if first custom bucket value is less than min value in given data set
        // we set min value of legend to starting value of custom buckets
        var minBucketValue = legendData.buckets[0].from;
        if (legendData.minValue > minBucketValue) {
            legendData.minValue = minBucketValue;
        }
        // if last custom bucket value is higher that max value in given data set
        // we set max value of legend to last custom bucket value
        var maxBucketValue = legendData.buckets[legendData.buckets.length - 1].to;
        if (legendData.maxValue < maxBucketValue) {
            legendData.maxValue = maxBucketValue;
        }
    }
    return legendData;
}
function getCategoricalLegend(data, colorColumn) {
    var legendData = {
        type: "categorical"
    };
    var customColorMap = colorHelpers.getCustomColorMap(colorColumn.categoricalOptions.colorOverwrites);
    var categoryObject = dataHelpers.getUniqueCategoriesObject(data, colorColumn);
    var categories = [];
    categoryObject.categories.forEach(function (label, index) {
        categories.push({
            label: label,
            color: colorHelpers.getCategoryColor(index, customColorMap)
        });
    });
    legendData.hasNullValues = categoryObject.hasNullValues;
    legendData.categories = categories;
    return legendData;
}
function getLabelLegend(legendData, maxDigitsAfterComma) {
    var range = legendData.maxValue - legendData.minValue;
    if (legendData.labelLegend === "median") {
        return {
            id: "median",
            label: "Median",
            value: dataHelpers.getRoundedValue(legendData.medianValue, maxDigitsAfterComma),
            position: ((legendData.medianValue - legendData.minValue) * 100) / range
        };
    }
    else if (legendData.labelLegend === "noLabel") {
        return { label: "noLabel" };
    }
    return {
        id: "average",
        label: "Durchschnitt",
        value: legendData.averageValue,
        position: ((legendData.averageValue - legendData.minValue) * 100) / range
    };
}
function getAvailableSpaceForLabel(labelLegend, contentWidth) {
    var legendPixelWidth;
    if (contentWidth > 640) {
        legendPixelWidth = widthConfig.legendSmall;
    }
    else {
        legendPixelWidth = (contentWidth * widthConfig.legendLarge) / 100;
    }
    return (legendPixelWidth * (100 - labelLegend.position)) / 100;
}
function getDescriptionAlignment(labelLegend, contentWidth, maxDigitsAfterComma) {
    var availableSpaceForLabel = getAvailableSpaceForLabel(labelLegend, contentWidth);
    var valueLength = getValueLength(labelLegend.value, maxDigitsAfterComma);
    var approxLabelWidth = widthConfig[labelLegend.id] + valueLength * 8;
    if (availableSpaceForLabel < approxLabelWidth) {
        return "text-align: right;";
    }
    return "margin-left: ".concat(labelLegend.position, "%");
}
function getValueLength(value, maxDigitsAfterComma) {
    return value.toFixed(0).length + maxDigitsAfterComma;
}
module.exports = {
    getNumericalLegend: getNumericalLegend,
    getCategoricalLegend: getCategoricalLegend
};

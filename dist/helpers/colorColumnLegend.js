import { getNumericalValuesByColumn, getNonNullValues, getMetaData, getCustomBucketBorders, getUniqueCategoriesObject } from './data.js';
import * as colorHelpers from './colorColumnColor.js';
import * as simpleStatistics from 'simple-statistics';
const ckmeans = simpleStatistics.ckmeans;
const quantile = simpleStatistics.quantile;
const widthConfig = {
    legendSmall: 640,
    legendLarge: 100,
    average: 100,
    median: 60,
};
export function getNumericalLegend(data, colorColumn, maxDigitsAfterComma, width) {
    const customColorMap = colorHelpers.getCustomColorMap(colorColumn.numericalOptions.colorOverwrites);
    const values = getNumericalValuesByColumn(data, colorColumn.selectedColumn);
    const nonNullValues = getNonNullValues(values);
    const metaData = getMetaData(values, nonNullValues, maxDigitsAfterComma);
    const legendData = Object.assign({ type: 'numerical', labelLegend: colorColumn.numericalOptions.labelLegend }, metaData);
    legendData.buckets = getBucketsForLegend(nonNullValues, colorColumn, legendData.minValue, legendData.maxValue, customColorMap, maxDigitsAfterComma);
    legendData.labelLegend = getLabelLegend(legendData, maxDigitsAfterComma);
    if (legendData.labelLegend.value) {
        legendData.labelLegend.descriptionAlignment = getDescriptionAlignment(legendData.labelLegend, width, maxDigitsAfterComma);
    }
    legendData.hasSingleValueBucket = hasSingleValueBucket(legendData);
    // for all bucket types we calculate the resulting buckets out of given data set
    // custom bucketing need a special handling of min/max values because the first and the last
    // custom bucket value could be lower/higher than min/max
    if (colorColumn.numericalOptions.bucketType === 'custom') {
        // if first custom bucket value is less than min value in given data set
        // we set min value of legend to starting value of custom buckets
        const minBucketValue = legendData.buckets[0].from;
        if (legendData.minValue > minBucketValue) {
            legendData.minValue = minBucketValue;
        }
        // if last custom bucket value is higher that max value in given data set
        // we set max value of legend to last custom bucket value
        const maxBucketValue = legendData.buckets[legendData.buckets.length - 1].to;
        if (legendData.maxValue < maxBucketValue) {
            legendData.maxValue = maxBucketValue;
        }
    }
    return legendData;
}
/**
 * Internal.
 */
/**
 * Interfaces.
 */
function getBucketsForLegend(filteredValues, colorColumn, minValue, maxValue, customColorMap, maxDigitsAfterComma) {
    const bucketType = colorColumn.numericalOptions.bucketType;
    const numberBuckets = colorColumn.numericalOptions.numberBuckets;
    const scale = colorColumn.numericalOptions.scale;
    const colorOptions = {
        colorScheme: colorColumn.numericalOptions.colorScheme,
        colorOverwrites: customColorMap,
    };
    if (bucketType === 'ckmeans') {
        return getCkMeansBuckets(filteredValues, numberBuckets, scale, colorOptions);
    }
    else if (bucketType === 'quantile') {
        return getQuantileBuckets(filteredValues, numberBuckets, minValue, scale, colorOptions);
    }
    else if (bucketType === 'equal') {
        return getEqualBuckets(numberBuckets, minValue, maxValue, scale, colorOptions, maxDigitsAfterComma);
    }
    else if (bucketType === 'custom') {
        return getCustomBuckets(colorColumn, scale, colorOptions);
    }
    return [];
}
function getCkMeansBuckets(filteredValues, numberBuckets, scale, colorOptions) {
    const ckmeansBuckets = ckmeans(filteredValues, numberBuckets);
    return ckmeansBuckets.map((bucket, index) => {
        const from = index === 0
            ? Math.min(...bucket)
            : Math.max(...ckmeansBuckets[index - 1]);
        const to = Math.max(...bucket);
        return {
            from,
            to,
            color: colorHelpers.getBucketColor(numberBuckets, index, scale, colorOptions),
        };
    });
}
function getQuantileBuckets(filteredValues, numberBuckets, minValue, scale, colorOptions) {
    const quantilePortion = 1 / numberBuckets;
    let quantiles = [];
    for (let i = 1; i <= numberBuckets; i++) {
        quantiles.push(i * quantilePortion);
    }
    const quantileUpperBorders = quantile(filteredValues, quantiles);
    return quantileUpperBorders.map((quantileBorder, index) => {
        const from = index === 0 ? minValue : quantileUpperBorders[index - 1];
        return {
            from,
            to: quantileBorder,
            color: colorHelpers.getBucketColor(numberBuckets, index, scale, colorOptions),
        };
    });
}
function getEqualBuckets(numberBuckets, minValue, maxValue, scale, colorOptions, maxDigitsAfterComma) {
    const portion = 1 / numberBuckets;
    const range = maxValue - minValue;
    let equalBuckets = [];
    for (let i = 0; i < numberBuckets; i++) {
        let from = i === 0 ? minValue : minValue + range * portion * i;
        let to = minValue + range * portion * (i + 1);
        // round numbers
        const roundingFactor = Math.pow(10, maxDigitsAfterComma);
        from = Math.round(from * roundingFactor) / roundingFactor;
        to = Math.round(to * roundingFactor) / roundingFactor;
        equalBuckets.push({
            from,
            to,
            color: colorHelpers.getBucketColor(numberBuckets, i, scale, colorOptions),
        });
    }
    return equalBuckets;
}
function getCustomBuckets(colorColumn, scale, colorOptions) {
    if (colorColumn.numericalOptions.customBuckets !== undefined) {
        const customBorderValues = getCustomBucketBorders(colorColumn.numericalOptions.customBuckets);
        const numberBuckets = customBorderValues.length - 1;
        const minBorder = customBorderValues.shift();
        let customBuckets = [];
        customBorderValues.forEach((borderValue, index) => {
            customBuckets.push({
                from: index === 0 ? minBorder : customBorderValues[index - 1],
                to: borderValue,
                color: colorHelpers.getBucketColor(numberBuckets, index, scale, colorOptions),
            });
        });
        return customBuckets;
    }
}
function hasSingleValueBucket(legendData) {
    const firstBucket = legendData.buckets[0];
    return firstBucket.from === firstBucket.to;
}
export function getCategoricalLegend(data, colorColumn) {
    const legendData = {
        type: 'categorical',
    };
    const customColorMap = colorHelpers.getCustomColorMap(colorColumn.categoricalOptions.colorOverwrites);
    const categoryObject = getUniqueCategoriesObject(data, colorColumn);
    let categories = [];
    categoryObject.categories.forEach((label, index) => {
        categories.push({
            label,
            color: colorHelpers.getCategoryColor(index, customColorMap),
        });
    });
    legendData.hasNullValues = categoryObject.hasNullValues;
    legendData.categories = categories;
    return legendData;
}
function getLabelLegend(legendData, maxDigitsAfterComma) {
    const range = legendData.maxValue - legendData.minValue;
    switch (legendData.labelLegend) {
        case 'noLabel':
            return { label: 'noLabel' };
        case 'median':
            return {
                id: 'median',
                label: 'Median',
                value: dataHelpers.getRoundedValue(legendData.medianValue, maxDigitsAfterComma),
                position: ((legendData.medianValue - legendData.minValue) * 100) / range,
            };
        default:
            return {
                id: 'average',
                label: 'Durchschnitt',
                value: legendData.averageValue,
                position: ((legendData.averageValue - legendData.minValue) * 100) / range,
            };
    }
}
function getAvailableSpaceForLabel(labelLegend, contentWidth) {
    let legendPixelWidth;
    if (contentWidth > 640) {
        legendPixelWidth = widthConfig.legendSmall;
    }
    else {
        legendPixelWidth = (contentWidth * widthConfig.legendLarge) / 100;
    }
    return (legendPixelWidth * (100 - labelLegend.position)) / 100;
}
function getDescriptionAlignment(labelLegend, contentWidth, maxDigitsAfterComma) {
    const availableSpaceForLabel = getAvailableSpaceForLabel(labelLegend, contentWidth);
    const valueLength = getValueLength(labelLegend.value, maxDigitsAfterComma);
    const approxLabelWidth = widthConfig[labelLegend.id] + valueLength * 8;
    if (availableSpaceForLabel < approxLabelWidth) {
        return 'text-align: right;';
    }
    return `margin-left: ${labelLegend.position}%`;
}
function getValueLength(value, maxDigitsAfterComma) {
    return value.toFixed(0).length + maxDigitsAfterComma;
}

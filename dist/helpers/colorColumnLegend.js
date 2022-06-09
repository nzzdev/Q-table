import { getNumericalValuesByColumn, getNonNullValues, getMetaData, getCustomBucketBorders, getUniqueCategoriesObject, getRoundedValue } from './data.js';
import { digitWords, getCustomColorMap, getTextColor } from './colorColumnColor.js';
import * as simpleStatistics from 'simple-statistics';
const ckmeans = simpleStatistics.ckmeans;
const quantile = simpleStatistics.quantile;
const widthConfig = {
    legendSmall: 640,
    legendLarge: 100,
    ["average" /* LABEL_LEGEND_ID.AVERAGE */]: 100,
    ["median" /* LABEL_LEGEND_ID.MEDIAN */]: 60,
};
export function getNumericalLegend(data, colorColumnSettings, maxDigitsAfterComma, width) {
    const { numericalOptions, selectedColumn } = colorColumnSettings;
    const customColorMap = getCustomColorMap(numericalOptions.colorOverwrites);
    const values = getNumericalValuesByColumn(data, selectedColumn);
    const nonNullValues = getNonNullValues(values);
    const metaData = getMetaData(values, nonNullValues, maxDigitsAfterComma);
    const buckets = getBucketsForLegend(nonNullValues, colorColumnSettings, metaData.minValue, metaData.maxValue, customColorMap, maxDigitsAfterComma);
    const labelLegend = getLabelLegend(numericalOptions.labelLegend, metaData, width, maxDigitsAfterComma);
    const legendData = Object.assign({ buckets, hasSingleValueBucket: hasSingleValueBucket(buckets), type: 'numerical', labelLegend }, metaData);
    // For all bucket types we calculate the resulting buckets out of a given dataset,
    // custom bucketing need a special handling of min/max values because the first and the last
    // custom bucket value could be lower/higher than min/max.
    if (numericalOptions.bucketType === 'custom') {
        // If first custom bucket value is less than min value in given data set
        // we set min value of legend to starting value of custom buckets.
        const minBucketValue = legendData.buckets[0].from;
        if (legendData.minValue > minBucketValue) {
            legendData.minValue = minBucketValue;
        }
        // iI last custom bucket value is higher that max value in given data set
        // we set max value of legend to last custom bucket value.
        const maxBucketValue = legendData.buckets[legendData.buckets.length - 1].to;
        if (legendData.maxValue < maxBucketValue) {
            legendData.maxValue = maxBucketValue;
        }
    }
    return legendData;
}
export function getCategoricalLegend(data, colorColumnSettings) {
    const { categoricalOptions } = colorColumnSettings;
    const type = 'categorical';
    const customColorMap = getCustomColorMap(categoricalOptions.colorOverwrites);
    const categoryObject = getUniqueCategoriesObject(data, colorColumnSettings);
    const hasNullValues = categoryObject.hasNullValues;
    let categories = [];
    categoryObject.categories.forEach((label, index) => {
        categories.push({
            label,
            color: getCategoryColor(index, customColorMap),
        });
    });
    return {
        hasNullValues,
        type,
        categories,
    };
}
export function getCategoryColor(index, customColorMap) {
    const customColor = customColorMap.get(index);
    const colorScheme = digitWords[index];
    const colorClass = `s-viz-color-${colorScheme}-5`;
    return {
        colorClass,
        customColor: customColor !== undefined && customColor.color !== undefined
            ? customColor.color
            : '',
        textColor: getTextColor(customColor, colorClass),
    };
}
/**
 * Internal.
 */
function getLabelLegend(labelType, metaData, width, maxDigitsAfterComma) {
    if (labelType === "noLabel" /* LABEL_LEGEND_ID.NO_LABEL */)
        return null;
    const { averageValue, minValue, maxValue, medianValue } = metaData;
    const range = maxValue - minValue;
    let position;
    let id;
    let value;
    let descriptionAlignment;
    let label;
    switch (labelType) {
        case "median" /* LABEL_LEGEND_ID.MEDIAN */:
            id = "median" /* LABEL_LEGEND_ID.MEDIAN */;
            position = ((medianValue - minValue) * 100) / range;
            value = getRoundedValue(medianValue, maxDigitsAfterComma);
            descriptionAlignment = getDescriptionAlignment(id, value, position, width, maxDigitsAfterComma);
            label = 'Median';
            break;
        default:
            id = "average" /* LABEL_LEGEND_ID.AVERAGE */;
            position = ((averageValue - minValue) * 100) / range;
            value = averageValue;
            descriptionAlignment = getDescriptionAlignment(id, value, position, width, maxDigitsAfterComma);
            label = 'Durchschnitt';
    }
    return {
        id,
        label,
        value,
        position,
        descriptionAlignment,
    };
}
function hasSingleValueBucket(buckets) {
    const firstBucket = buckets[0];
    return firstBucket.from === firstBucket.to;
}
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
            color: getBucketColor(numberBuckets, index, scale, colorOptions),
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
            color: getBucketColor(numberBuckets, index, scale, colorOptions),
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
            color: getBucketColor(numberBuckets, i, scale, colorOptions),
        });
    }
    return equalBuckets;
}
function getCustomBuckets(colorColumnSettings, scale, colorOptions) {
    const { numericalOptions } = colorColumnSettings;
    if (numericalOptions.customBuckets !== undefined) {
        const customBorderValues = getCustomBucketBorders(numericalOptions.customBuckets);
        const numberBuckets = customBorderValues.length - 1;
        const minBorder = customBorderValues.shift() || 0;
        let customBuckets = [];
        customBorderValues.forEach((borderValue, index) => {
            customBuckets.push({
                from: index === 0 ? minBorder : customBorderValues[index - 1],
                to: borderValue,
                color: getBucketColor(numberBuckets, index, scale, colorOptions),
            });
        });
        return customBuckets;
    }
    return [];
}
function getDescriptionAlignment(id, value, position, width, maxDigitsAfterComma) {
    const availableSpaceForLabel = getAvailableSpaceForLabel(position, width);
    const valueLength = getValueLength(value, maxDigitsAfterComma);
    const approxLabelWidth = widthConfig[id] + valueLength * 8;
    if (availableSpaceForLabel < approxLabelWidth) {
        return 'text-align: right;';
    }
    return `margin-left: ${position}%`;
}
function getAvailableSpaceForLabel(position, width) {
    let legendPixelWidth;
    if (width > 640) {
        legendPixelWidth = widthConfig.legendSmall;
    }
    else {
        legendPixelWidth = (width * widthConfig.legendLarge) / 100;
    }
    return (legendPixelWidth * (100 - position)) / 100;
}
function getValueLength(value, maxDigitsAfterComma) {
    return value.toFixed(0).length + maxDigitsAfterComma;
}
function getBucketColor(numberBuckets, index, scale, colorOptions) {
    const colorScheme = colorOptions.colorScheme;
    const customColor = colorOptions.colorOverwrites.get(index);
    let colorClass = '';
    let textColor = '';
    if (scale === 'sequential') {
        colorClass = `s-viz-color-sequential-${colorScheme}-${numberBuckets}-${numberBuckets - index}`;
        textColor = getTextColor(customColor, colorClass);
    }
    else {
        // if we have a diverging scale we deal with two cases:
        // a) diverging value = one of bucket border values,
        //    i.e. we do not have a bucket with a neutral color value
        // b) diverging value = one of the buckets,
        //    i.e. this bucket has a neutral color value
        // scale values could be e.g. border-1, border-2 or bucket-1, bucket-2
        const divergingSpecification = scale.split('-');
        const divergingIndex = parseInt(divergingSpecification[1]);
        // in order to know which diverging scale size we have to use,
        // we have to check which side is bigger first and then calculate
        // the size depending on the number of buckets of the bigger side
        const numberBucketsLeft = divergingIndex;
        let numberBucketsRight = numberBuckets - divergingIndex;
        if (divergingSpecification[0] === 'bucket') {
            numberBucketsRight -= 1;
        }
        const numberBucketsBiggerSide = Math.max(numberBucketsLeft, numberBucketsRight);
        let scaleSize = numberBucketsBiggerSide * 2;
        if (divergingSpecification[0] === 'bucket') {
            scaleSize += 1;
        }
        // if the left side is smaller we cannot start with scale position 1
        // instead we have to calculate the position depending on scale size
        // and number of buckets
        let scalePosition;
        if (numberBucketsLeft < numberBucketsRight) {
            scalePosition = scaleSize - numberBuckets + index + 1;
        }
        else {
            scalePosition = index + 1;
        }
        colorClass = `s-viz-color-diverging-${colorScheme}-${scaleSize}-${scalePosition}`;
        textColor = getTextColor(customColor, colorClass);
    }
    return {
        colorClass,
        customColor: customColor !== undefined && customColor.color !== undefined
            ? customColor.color
            : '',
        textColor,
    };
}

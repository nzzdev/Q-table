import { getMaxDigitsAfterCommaInDataByRow, getNumericalValuesByColumn, getFormattedBuckets, getFormattedValue, getCategoricalValuesByColumn, getCustomBucketBorders } from './data.js';
import { getCategoricalLegend, getNumericalLegend } from './colorColumnLegend.js';
import * as methodBoxHelpers from './colorColomnMethodBox.js';
export function hasCustomBuckets(bucketType) {
    return bucketType === 'custom';
}
export function getNumberBuckets(colorColumn) {
    try {
        if (colorColumn.numericalOptions.bucketType !== 'custom') {
            return colorColumn.numericalOptions.numberBuckets;
        }
        else {
            const bucketBorderValues = getCustomBucketBorders(colorColumn.numericalOptions.customBuckets);
            return bucketBorderValues.length - 1; // min value is part of border values and has to be excluded here
        }
    }
    catch (_a) {
        return 0;
    }
}
export function getColorColumn(colorColumnAvailable, settings, data, width) {
    if (colorColumnAvailable && typeof (settings === null || settings === void 0 ? void 0 : settings.selectedColumn) === 'number') {
        const selectedColumn = settings.selectedColumn;
        if (settings.colorColumnType === 'numerical') {
            return createNumericalColorColumn(selectedColumn, settings, data, width);
        }
        else {
            return createCategoricalColorColumn(selectedColumn, settings, data, width);
        }
    }
    return null;
}
function createNumericalColorColumn(selectedColumn, settings, data, width) {
    const maxDigitsAfterComma = getMaxDigitsAfterCommaInDataByRow(data, selectedColumn);
    const roundingBucketBorders = settings.numericalOptions.bucketType !== 'custom';
    let formattingOptions = {
        maxDigitsAfterComma,
        roundingBucketBorders,
    };
    const legendData = getNumericalLegend(selectedColumn, data, settings, maxDigitsAfterComma, width);
    const methodBox = methodBoxHelpers.getMethodBoxInfo(settings.numericalOptions.bucketType);
    methodBox.formattedBuckets = getFormattedBuckets(formattingOptions, legendData.buckets);
    const formattedValues = [];
    const colors = [];
    if (typeof settings.selectedColumn == 'number') {
        const valuesByColumn = getNumericalValuesByColumn(data, settings.selectedColumn);
        valuesByColumn.map((value) => {
            const color = getColor(value, legendData);
            colors.push(color);
            const formattedValue = getFormattedValue(formattingOptions, value);
            formattedValues.push(formattedValue);
        });
    }
    return Object.assign({ legendData,
        methodBox,
        formattedValues,
        colors }, settings);
}
function createCategoricalColorColumn(selectedColumn, settings, data, width) {
    const legendData = getCategoricalLegend(data, settings);
    const categoriesByColumn = getCategoricalValuesByColumn(data, selectedColumn);
    const colors = [];
    categoriesByColumn.map((category) => {
        const color = getColor(category, legendData);
        colors.push(color);
    });
    return Object.assign({ legendData, methodBox: null, formattedValues: [], colors }, settings);
}
/**
 * Internal.
 */
function getColor(value, legendData) {
    if (value === null || value === undefined) {
        return {
            colorClass: '',
            customColor: '#fff',
            textColor: 's-color-gray-6',
        };
    }
    if (legendData.type === 'numerical') {
        const buckets = legendData.buckets;
        const bucket = buckets.find((bucket, index) => {
            if (index === 0) {
                return value <= bucket.to;
            }
            else if (index === buckets.length - 1) {
                return bucket.from < value;
            }
            else {
                return bucket.from < value && value <= bucket.to;
            }
        });
        if (bucket) {
            return {
                colorClass: bucket.color.colorClass,
                customColor: bucket.color.customColor,
                textColor: bucket.color.textColor,
            };
        }
        else {
            return {
                colorClass: 's-color-gray-4',
                customColor: '',
                textColor: 's-color-gray-6',
            };
        }
    }
    else {
        const categories = legendData.categories;
        const category = categories.find((category) => category.label === value);
        if (category) {
            return {
                colorClass: category.color.colorClass,
                customColor: category.color.customColor,
                textColor: category.color.textColor,
            };
        }
        else {
            return {
                colorClass: 's-color-gray-4',
                customColor: '',
                textColor: '',
            };
        }
    }
}

import * as dataHelpers from './data.js';
import * as legendHelpers from './colorColumnLegend.js';
import * as colorHelpers from './colorColumnColor.js';
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
            const bucketBorderValues = dataHelpers.getCustomBucketBorders(colorColumn.numericalOptions.customBuckets);
            return bucketBorderValues.length - 1; // min value is part of border values and has to be excluded here
        }
    }
    catch (_a) {
        return 0;
    }
}
export function getColorColumnContext(colorColumn, data, width) {
    let colorColumnContext = {};
    if (selectedColumnIsValid(colorColumn)) {
        let colors = [];
        if (colorColumn.colorColumnType === 'numerical') {
            const maxDigitsAfterComma = dataHelpers.getMaxDigitsAfterCommaInDataByRow(data, colorColumn.selectedColumn);
            const roundingBucketBorders = colorColumn.numericalOptions.bucketType !== 'custom';
            let formattingOptions = {
                maxDigitsAfterComma,
                roundingBucketBorders,
            };
            colorColumnContext.legendData = legendHelpers.getNumericalLegend(data, colorColumn, formattingOptions.maxDigitsAfterComma, width);
            colorColumnContext.methodBox = methodBoxHelpers.getMethodBoxInfo(colorColumn.numericalOptions.bucketType);
            let valuesByColumn = dataHelpers.getNumericalValuesByColumn(data, colorColumn.selectedColumn);
            colorColumnContext.formattedValues = [];
            colorColumnContext.methodBox.formattedBuckets = dataHelpers.getFormattedBuckets(formattingOptions, colorColumnContext.legendData.buckets);
            valuesByColumn.map((value) => {
                let color = colorHelpers.getColor(value, colorColumnContext.legendData);
                colors = [...colors, color];
                colorColumnContext.formattedValues = [
                    ...colorColumnContext.formattedValues,
                    dataHelpers.getFormattedValue(formattingOptions, value),
                ];
            });
        }
        else {
            colorColumnContext.legendData = legendHelpers.getCategoricalLegend(data, colorColumn);
            let categoriesByColumn = dataHelpers.getCategoricalValuesByColumn(data, colorColumn.selectedColumn);
            categoriesByColumn.map((category) => {
                let color = colorHelpers.getColor(category, colorColumnContext.legendData);
                colors = [...colors, color];
            });
        }
        colorColumnContext = Object.assign(Object.assign(Object.assign({}, colorColumnContext), colorColumn), { colors });
    }
    return colorColumnContext;
}
/**
 * Internal.
 */
function selectedColumnIsValid(colorColumn) {
    return colorColumn !== null &&
        colorColumn !== undefined &&
        colorColumn.selectedColumn !== null &&
        colorColumn.selectedColumn !== undefined;
}

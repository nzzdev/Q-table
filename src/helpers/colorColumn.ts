import { getMaxDigitsAfterCommaInDataByRow, getNumericalValuesByColumn, getFormattedBuckets, getFormattedValue, getCategoricalValuesByColumn, getCustomBucketBorders } from './data.js';
import * as legendHelpers from './colorColumnLegend.js';
import * as colorHelpers from './colorColumnColor.js';
import * as methodBoxHelpers from './colorColomnMethodBox.js';

import type { BucketType, ColorColumn, QTableDataRaw } from '../interfaces';
import type { NumericalLegend } from './colorColumnLegend';
import type { MethodBoxInfo } from './colorColomnMethodBox';

export interface ColorColumnContext {
  legendData?: NumericalLegend,
  methodBox?: MethodBoxInfo,
  formattedValues?: [],
}

export function hasCustomBuckets(bucketType: BucketType): boolean {
  return bucketType === 'custom';
}

export function getNumberBuckets(colorColumn): number {
  try {
    if (colorColumn.numericalOptions.bucketType !== 'custom') {
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

export function getColorColumnContext(colorColumn: ColorColumn, data: QTableDataRaw, width: number): ColorColumnContext {
  let colorColumnContext: ColorColumnContext = {};

  if (selectedColumnIsValid(colorColumn)) {
    let colors = [];

    if (colorColumn.colorColumnType === 'numerical') {
      const maxDigitsAfterComma = getMaxDigitsAfterCommaInDataByRow(data, colorColumn.selectedColumn);
      const roundingBucketBorders = colorColumn.numericalOptions.bucketType !== 'custom';

      let formattingOptions = {
        maxDigitsAfterComma,
        roundingBucketBorders,
      };

      colorColumnContext.legendData = legendHelpers.getNumericalLegend(data, colorColumn, maxDigitsAfterComma, width);

      colorColumnContext.methodBox = methodBoxHelpers.getMethodBoxInfo(colorColumn.numericalOptions.bucketType);

      let valuesByColumn = getNumericalValuesByColumn(data, colorColumn.selectedColumn);

      colorColumnContext.formattedValues = [];

      colorColumnContext.methodBox.formattedBuckets = getFormattedBuckets(formattingOptions, colorColumnContext.legendData.buckets);
      valuesByColumn.map((value) => {
        let color = colorHelpers.getColor(value, colorColumnContext.legendData);
        colors = [...colors, color];
        colorColumnContext.formattedValues = [
          ...colorColumnContext.formattedValues,
          getFormattedValue(formattingOptions, value),
        ];
      });
    } else {
      colorColumnContext.legendData = legendHelpers.getCategoricalLegend(
        data,
        colorColumn
      );

      let categoriesByColumn = getCategoricalValuesByColumn(
        data,
        colorColumn.selectedColumn
      );
      categoriesByColumn.map((category) => {
        let color = colorHelpers.getColor(
          category,
          colorColumnContext.legendData
        );
        colors = [...colors, color];
      });
    }
    colorColumnContext = { ...colorColumnContext, ...colorColumn, colors };
  }

  return colorColumnContext;
}

/**
 * Internal.
 */
function selectedColumnIsValid(colorColumn: ColorColumn): boolean {
  return colorColumn !== null &&
         colorColumn !== undefined &&
         colorColumn.selectedColumn !== null &&
         colorColumn.selectedColumn !== undefined;
}
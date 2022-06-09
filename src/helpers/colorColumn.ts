import { getMaxDigitsAfterCommaInDataByRow, getNumericalValuesByColumn, getFormattedBuckets, getFormattedValue, getCategoricalValuesByColumn, getCustomBucketBorders } from './data.js';
import * as legendHelpers from './colorColumnLegend.js';
import * as methodBoxHelpers from './colorColomnMethodBox.js';

import type { BucketType, ColorColumnSettings, QTableDataRaw } from '../interfaces';
import type { CategoricalLegend, NumericalLegend } from './colorColumnLegend';
import type { MethodBoxInfo } from './colorColomnMethodBox';

export function hasCustomBuckets(bucketType: BucketType): boolean {
  return bucketType === 'custom';
}

export function getNumberBuckets(colorColumn: ColorColumnSettings): number {
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

export function getColorColumn(colorColumnAvailable: boolean, settings: ColorColumnSettings, data: QTableDataRaw, width: number): ColorColumn | null {
  if (colorColumnAvailable && selectedColumnIsValid(settings)) {
    if (settings.colorColumnType === 'numerical') {
      return createNumericalColorColumn(settings, data, width);
    } else {
      return createCategoricalColorColumn(settings, data, width);
    }
  }

  return null;
}

function createNumericalColorColumn(settings: ColorColumnSettings, data: QTableDataRaw, width: number): ColorColumn {
  const maxDigitsAfterComma = getMaxDigitsAfterCommaInDataByRow(data, settings.selectedColumn);
  const roundingBucketBorders = settings.numericalOptions.bucketType !== 'custom';

  let formattingOptions = {
    maxDigitsAfterComma,
    roundingBucketBorders,
  };

  const legendData = legendHelpers.getNumericalLegend(data, settings, maxDigitsAfterComma, width);

  const methodBox = methodBoxHelpers.getMethodBoxInfo(settings.numericalOptions.bucketType);
  methodBox.formattedBuckets = getFormattedBuckets(formattingOptions, legendData.buckets);

  const formattedValues: string[] = [];
  const colors: ColumnColorSettings[] = [];
  const valuesByColumn = getNumericalValuesByColumn(data, settings.selectedColumn);

  valuesByColumn.map((value) => {
    const color = getColor(value, legendData);
    colors.push(color);

    const formattedValue = getFormattedValue(formattingOptions, value);
    formattedValues.push(formattedValue)
  });

  return {
    legendData,
    methodBox,
    formattedValues,
    ...settings,
  }
}

function createCategoricalColorColumn(settings: ColorColumnSettings, data: QTableDataRaw, width: number): ColorColumn {
  const legendData = legendHelpers.getCategoricalLegend(data, settings);
  const categoriesByColumn = getCategoricalValuesByColumn(data, settings.selectedColumn);

  const colors: ColumnColorSettings[] = [];

  categoriesByColumn.map((category) => {
    const color = getColor(category, legendData);
    colors.push(color);
  });

  return {
    legendData,
    methodBox: null,
    formattedValues: [],
    ...settings,
  }
}

/**
 * Internal.
 */
function selectedColumnIsValid(settings: ColorColumnSettings): boolean {
  return settings !== null &&
         settings !== undefined &&
         settings.selectedColumn !== null &&
         settings.selectedColumn !== undefined;
}

function getColor(value, legendData): ColumnColorSettings {
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
      } else if (index === buckets.length - 1) {
        return bucket.from < value;
      } else {
        return bucket.from < value && value <= bucket.to;
      }
    });
    if (bucket) {
      return {
        colorClass: bucket.color.colorClass,
        customColor: bucket.color.customColor,
        textColor: bucket.color.textColor,
      };
    } else {
      return {
        colorClass: 's-color-gray-4',
        customColor: '',
        textColor: 's-color-gray-6',
      };
    }
  } else {
    const categories = legendData.categories;
    const category = categories.find((category) => category.label === value);
    if (category) {
      return {
        colorClass: category.color.colorClass,
        customColor: category.color.customColor,
        textColor: category.color.textColor,
      };
    } else {
      return {
        colorClass: 's-color-gray-4',
        customColor: '',
        textColor: '',
      };
    }
  }
}

/**
 * Interfaces.
 */

export interface ColorColumn extends ColorColumnSettings {
  legendData: NumericalLegend | CategoricalLegend,
  methodBox: MethodBoxInfo | null,
  formattedValues: string[],
}

export interface ColorColumnContext {
  legendData?: NumericalLegend,
  methodBox?: MethodBoxInfo,
  formattedValues?: [],
}

interface ColumnColorSettings {
  colorClass: string,
  customColor: string,
  textColor: string,
}

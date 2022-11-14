import type { QTableDataRaw, QTableConfigMinibarSettings, Cell } from '../interfaces';

export const enum MINIBAR_TYPE {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
  MIXED = 'mixed',
  EMPTY = 'empty',
}

export function getMinibar(minibarsAvailable: boolean, minibarSettings: QTableConfigMinibarSettings, columns: Cell<number>[][]): Minibar {
  // A minibar with a columnIndex of null will not be shown.
  const minibar: Minibar = {
    columnIndex: null,
    values: [],
    type: MINIBAR_TYPE.EMPTY,
    barColor: minibarSettings.barColor,
    settings: minibarSettings,
  };

  // If we actually have valid settings for the minibar we will populate
  // Minibar object with correct values.
  if (minibarsAvailable === true && typeof minibarSettings.selectedColumn === 'number') {
    const column = columns[minibarSettings.selectedColumn];
    const valuesAndType = getMinibarValuesAndType(column);

    minibar.columnIndex = minibarSettings.selectedColumn;
    minibar.type = valuesAndType.minibarType;
    minibar.values = valuesAndType.values;

    checkPositiveBarColor(minibar);
    checkNegativeBarColor(minibar);

    if (minibarSettings.invertColors) {
      invertBarColors(minibar);
    }
  }

  return minibar;
}

function getMinibarValuesAndType(column: Cell<number>[]): { values: number[], minibarType: MINIBAR_TYPE } {
  let minValue = 0;
  let maxValue = 0;
  let minibarType = MINIBAR_TYPE.MIXED;

  column.forEach(cell =>  {
    const value = cell.value;

    if (minValue === null || value < minValue) {
      minValue = value;
    }

    if (maxValue === null || value > maxValue) {
      maxValue = value;
    }
  });

  if (minValue <= 0 && maxValue <= 0) {
    minibarType = MINIBAR_TYPE.NEGATIVE;
  } else if (minValue >= 0 && maxValue >= 0) {
    minibarType = MINIBAR_TYPE.POSITIVE
  }

  const values = column.map(cell => {
    return getMinibarValue(minibarType, cell.value, minValue, maxValue);
  });

  return {
    values,
    minibarType,
  }
}

function getMinibarValue(type: MINIBAR_TYPE, value: number, min: number, max: number): number {
  if (value === null) return 0;

  switch (type) {
    case MINIBAR_TYPE.POSITIVE:
      return Math.abs((value * 100) / max);

    case MINIBAR_TYPE.NEGATIVE:
      return Math.abs((value * 100) / min);

    default:
      return Math.abs((value * 100) / Math.max(Math.abs(min), Math.abs(max))) / 2;
  }
}

/**
 * Used in option availability.
 */
export function getMinibarNumbersWithType(data: QTableDataRaw, selectedColumnIndex: number): MinibarNumbersWithType {
  const minibarsWithType: MinibarNumbersWithType = {
    items: [],
    numbers: [],
    type: MINIBAR_TYPE.MIXED,
  };

  // First row is always header so we add a null entry for it.
  minibarsWithType.items.push({
    value: null,
    type: MINIBAR_TYPE.EMPTY,
  });

  // First row is always header so start at 1.
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const cell = row[selectedColumnIndex];
    const value = parseFloat(cell || '');

    if (isNaN(value)) {
      minibarsWithType.items.push({
        value: null,
        type: MINIBAR_TYPE.EMPTY,
      });
    } else {
      const type = getTypeOfValue(value);
      minibarsWithType.numbers.push(value);

      minibarsWithType.items.push({
        value,
        type,
      });
    }
  }

  minibarsWithType.type = getMinibarType(minibarsWithType.numbers);

  return minibarsWithType;
}

function checkPositiveBarColor(minibar: Minibar): void {
  const className = minibar.barColor.positive.className;
  const colorCode = minibar.barColor.positive.colorCode;

  if (className === '' && colorCode === '') {
    minibar.barColor.positive.className = getPositiveColor(minibar.type);
  } else if (className !== '') {
    minibar.barColor.positive.colorCode = '';
  }
}

function checkNegativeBarColor(minibar: Minibar): void {
  const className = minibar.barColor.negative.className;
  const colorCode = minibar.barColor.negative.colorCode;

  if (className === '' && colorCode === '') {
    minibar.barColor.negative.className = getNegativeColor(minibar.type);
  } else if (className !== '') {
    minibar.barColor.negative.colorCode = '';
  }
}

function invertBarColors(minibar: Minibar): void {
  const temp = minibar.barColor.negative;
  minibar.barColor.negative = minibar.barColor.positive;
  minibar.barColor.positive = temp;
}

function getTypeOfValue(value: number): MINIBAR_TYPE {
  if (value < 0) {
    return MINIBAR_TYPE.NEGATIVE;
  }

  if (value > 0) {
    return MINIBAR_TYPE.POSITIVE;
  }

  return MINIBAR_TYPE.EMPTY;
}

function getMinibarType(numbers: number[]): MINIBAR_TYPE {
  const allPositive = numbers.every(number => number >= 0);
  const allNegative = numbers.every(number => number <= 0);

  if (allPositive) {
    return MINIBAR_TYPE.POSITIVE;
  } else if (allNegative) {
    return MINIBAR_TYPE.NEGATIVE;
  }

  return MINIBAR_TYPE.MIXED;
}

function getPositiveColor(type: string): string {
  if (type === 'mixed') {
    return 's-viz-color-diverging-2-2';
  }

  return 's-viz-color-one-5';
}

function getNegativeColor(type: string): string {
  if (type === 'mixed') {
    return 's-viz-color-diverging-2-1';
  }

  return 's-viz-color-one-5';
}

/**
 * Interfaces.
 */
export interface Minibar {
  columnIndex: number | null;
  barColor: {
    positive: { className: string; colorCode: string };
    negative: { className: string; colorCode: string };
  };
  type: MINIBAR_TYPE;
  // values: Array<{ type: string; value: number | null }>;

  values: number[];
  settings: QTableConfigMinibarSettings;
}

interface MinibarNumbersWithType {
  numbers: number[];
  items: Array<{ type: string; value: number | null }>;
  type: MINIBAR_TYPE;
}

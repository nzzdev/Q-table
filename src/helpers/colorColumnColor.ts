import colorClassWithLightFontList from './colorClassLightFont.js';

import type { ColorOverwrites } from '../interfaces';

export const digitWords = [
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
];

const gray1 = 's-color-gray-1';
// const gray4 = 's-color-gray-4';
// const gray6 = 's-color-gray-6';
// const gray7 = 's-color-gray-7';
// const gray8 = 's-color-gray-8';
const gray9 = 's-color-gray-9';

export function getTextColor(customColor: { color: string, textColor: string} | undefined, colorClass: string): string {
  if(customColor?.textColor !== undefined) {
    return customColor.textColor === 'light' ? gray1 : gray9;
  }

  if (colorClassWithLightFontList.indexOf(colorClass) > -1) {
    return gray1;
  }

  return gray9;
}

export function getCustomColorMap(colorOverwrites: ColorOverwrites[]): CustomColorMap {
  return new Map(
    colorOverwrites.map(({ color, position, textColor }) => [
      position - 1,
      { color, textColor },
    ])
  );
}

/**
 * Interfaces.
 */

export type CustomColorMap = Map<number, {
  color: string;
  textColor: string;
}>;

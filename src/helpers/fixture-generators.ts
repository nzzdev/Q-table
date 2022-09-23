import type { Cell, Source } from '@src/interfaces';
import type { StructuredFootnote } from '@src/helpers/footnotes';
// import { MINIBAR_TYPE, type Minibar } from './minibars';

export function createSourceFixture(override: Partial<Source> = {}): Source {
  return {
    link: {
      url: 'https://google.com',
      isValid: true,
    },
    text: 'google',
    ...override,
  };
}

export function createFootnoteFixture(override: Partial<StructuredFootnote> = {}): StructuredFootnote {
  return {
    value: 'ft',
    index: 1,
    coords: [
      {
        colIndex: 1,
        rowIndex: 1,
      },
    ],
    ...override,
  };
}

export function createQTableDataFormattedFixture(override: Partial<Cell> = {}): Cell {
  return {
    type: 'type',
    value: 'value',
    classes: ['cls1', 'cls2'],
    footnote: {
      value: 1,
      unicode: 'unicode',
      class: 'cls',
    },
    ...override,
  };
}

// export function createMinibarFixture(override: Partial<Minibar> = {}): Minibar {
//   return {
//     barColor: {
//       positive: { className: 'pos', colorCode: '#F00' };
//       negative: { className: 'neg'; colorCode: '#00F' };
//     },
//     type: MINIBAR_TYPE.POSITIVE,
//     // values: Array<{ type: string; value: number | null }>,
//     // settings: QTableConfigMinibarSettings,
//   };
// }

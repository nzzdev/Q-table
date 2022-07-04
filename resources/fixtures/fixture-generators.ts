import type { Source } from '@src/interfaces';
import type { StructuredFootnote } from '@src/helpers/footnotes';

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

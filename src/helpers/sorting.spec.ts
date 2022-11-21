import type { Row } from '@src/interfaces';
import { sortRows } from './sorting';

const text = [
  'A',
  'aa',
  '-',
  'Ab',
  'B',
  '',
];
const numeric = [
  10000.5,
  10000,
  35547.5,
  0,
  -3500000,
];

const createTableFixture = (): Row[] => {
  return [...Array(6).keys()].map((e, i) => {
    return {
      key: i,
      cells: [
        {
          type: 'text',
          label: 'text',
          value: text[i],
          classes: [],
          footnote: '',
        },
        {
          type: 'numeric',
          label: `${numeric[i]}`,
          value: numeric[i],
          classes: [],
          footnote: '',
        },
      ],
    };
  });
};

describe('Text sorting', () => {
  it('should sort text ascending', () => {
    const resultText = [
      '',
      '-',
      'A',
      'aa',
      'Ab',
      'B',
    ];
    const sortedText = createTableFixture().sort((a, b) =>
      sortRows(a, b, 0, 'text', 'asc')
    );
    sortedText.forEach((row, i) => {
      expect(row.cells[0].value).toEqual(resultText[i]);
    });
  });

  it('should sort text descending', () => {
    const resultText = [
      'B',
      'Ab',
      'aa',
      'A',
      '-',
      '',
    ];
    const sortedText = createTableFixture().sort((a, b) =>
      sortRows(a, b, 0, 'text', 'desc')
    );
    sortedText.forEach((row, i) => {
      expect(row.cells[0].value).toEqual(resultText[i]);
    });
  });
});

describe('Numeric sorting', () => {

  it('should sort numbers ascending', () => {
    const resultNumeric = [
      -3500000,
      0,
      10000,
      10000.5,
      35547.5,
    ];

    const sortedNumeric = createTableFixture().sort((a, b) =>
      sortRows(a, b, 1, 'numeric', 'asc')
    );

    sortedNumeric.forEach((row, i) => {
      expect(row.cells[1].value).toEqual(resultNumeric[i]);
    });
  });

  it('should sort numbers descending', () => {
    const resultNumeric = [
      35547.5,
      10000.5,
      10000,
      0,
      -3500000,
    ];

    const sortedNumeric = createTableFixture().sort((a, b) =>
      sortRows(a, b, 1, 'numeric', 'desc')
    );

    sortedNumeric.forEach((row, i) => {
      expect(row.cells[1].value).toEqual(resultNumeric[i]);
    });
  });
});

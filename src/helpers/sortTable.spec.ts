import type { Row } from '@src/interfaces';
import { sortTable } from './sortTable';

const text = [
  'A', //  0 (index)
  'aa', // 1
  '-', //  2
  'Ab', // 3
  'B', //  4
  null, // 5
];
const numeric = [
  '10 000,5', //   0 (index)
  '10 000', //     1
  '35 547,5', //   2
  '-', //          3
  null, //         4
  '-3 500 000', // 5
];

const createTableFixture = (): Row[] => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  return [...Array(6).keys()].map((e, i) => {
    return {
      key: i,
      cells: [
        {
          type: 'text',
          value: text[i],
          classes: [],
        },
        {
          type: 'numeric',
          value: numeric[i],
          classes: [],
        },
      ],
    } as Row;
  });
};

describe('sort asc', () => {
  it('should sort text', () => {
    const resultText = [
      'A', //  0 (index)
      'aa', // 1
      'Ab', // 3
      'B', //  4
      '-', //  2
      null, // 5
    ];
    const sortedText = createTableFixture().sort((a, b) =>
      sortTable(a, b, 0, 'text', 'asc')
    );
    sortedText.forEach((row, i) => {
      expect(row.cells[0].value).toEqual(resultText[i]);
    });
  });

  it('should sort numeric', () => {
    const resultNumeric = [
      '-3 500 000', // 5 (index)
      '10 000', //     1
      '10 000,5', //   0
      '35 547,5', //   2
      '-', //          3
      null, //         4
    ];
    const sortedNumeric = createTableFixture().sort((a, b) =>
      sortTable(a, b, 1, 'numeric', 'asc')
    );
    sortedNumeric.forEach((row, i) => {
      expect(row.cells[1].value).toEqual(resultNumeric[i]);
    });
  });

  describe('sort dsc', () => {
    it('should sort text', () => {
      const resultText = [
        null, // 5 (index)
        '-', //  2
        'B', //  4
        'Ab', // 3
        'aa', // 1
        'A', //  0
      ];
      const sortedText = createTableFixture().sort((a, b) =>
        sortTable(a, b, 0, 'text', 'dsc')
      );
      sortedText.forEach((row, i) => {
        expect(row.cells[0].value).toEqual(resultText[i]);
      });
    });

    it('should sort numeric', () => {
      const resultNumeric = [
        null, //         4 (index)
        '-', //          3
        '35 547,5', //   2
        '10 000,5', //   0
        '10 000', //     1
        '-3 500 000', // 5
      ];
      const sortedNumeric = createTableFixture().sort((a, b) =>
        sortTable(a, b, 1, 'numeric', 'dsc')
      );
      sortedNumeric.forEach((row, i) => {
        expect(row.cells[1].value).toEqual(resultNumeric[i]);
      });
    });
  });
});

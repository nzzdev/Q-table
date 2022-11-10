import type { Row, SortDirection, TableColumnType } from '@src/interfaces';

export const sortRows = (
  rowA: Row,
  rowB: Row,
  colIndex: number,
  type: TableColumnType,
  direction: SortDirection
): number => {

  const valueA = rowA.cells[colIndex].value as string;
  const valueB = rowB.cells[colIndex].value as string;

  if (type === 'text' || type === 'country-flag-emoji') {
    return direction === 'asc'
    ? valueA.localeCompare(valueB, 'de')
    : valueB.localeCompare(valueA, 'de');
  }

  const valueAnum = rowA.cells[colIndex].value as number;
  const valueBnum = rowB.cells[colIndex].value as number;

  // Default numeric compare.
  if (direction === 'asc') {
    return valueAnum - valueBnum;
  }

  return valueBnum - valueAnum;



  // if (
  //   !rowA?.cells ||
  //   !rowA.cells[sortingColIndex] ||
  //   typeof rowA.cells[sortingColIndex].value !== 'string'
  // )
  //   return direction === 'asc' ? 1 : -1;

  // if (
  //   !rowB?.cells ||
  //   !rowB.cells[sortingColIndex] ||
  //   typeof rowB.cells[sortingColIndex].value !== 'string'
  // )
  //   return direction === 'asc' ? -1 : 1;

  // const a: string = rowA.cells[sortingColIndex].value as string;
  // const b: string = rowB.cells[sortingColIndex].value as string;

  // if (a === '-') return direction === 'asc' ? 1 : -1;
  // if (b === '-') return direction === 'asc' ? -1 : 1;

  // if (type === 'numeric')
  //   return direction === 'asc' ? parse(a) - parse(b) : parse(b) - parse(a);

  // return direction === 'asc'
  //   ? a.localeCompare(b, 'de')
  //   : b.localeCompare(a, 'de');
};

const parse = (s: string): number => {
  return parseFloat(s.replace(/\s+/g, '').replace(',', '.').replace('–', '-'));
};

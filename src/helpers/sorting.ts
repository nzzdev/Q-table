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
};

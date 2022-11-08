import type { CellType, Row, SortDirection } from '@src/interfaces';

export const sortTable = (
  rowA: Row,
  rowB: Row,
  sortingColIndex: number,
  type: CellType,
  direction: SortDirection
): number => {
  if (
    !rowA?.cells ||
    !rowA.cells[sortingColIndex] ||
    typeof rowA.cells[sortingColIndex].value !== 'string'
  )
    return direction === 'asc' ? 1 : -1;

  if (
    !rowB?.cells ||
    !rowB.cells[sortingColIndex] ||
    typeof rowB.cells[sortingColIndex].value !== 'string'
  )
    return direction === 'asc' ? -1 : 1;

  const a: string = rowA.cells[sortingColIndex].value as string;
  const b: string = rowB.cells[sortingColIndex].value as string;

  if (a === '-') return direction === 'asc' ? 1 : -1;
  if (b === '-') return direction === 'asc' ? -1 : 1;

  if (type === 'numeric')
    return direction === 'asc' ? parse(a) - parse(b) : parse(b) - parse(a);

  return direction === 'asc'
    ? a.localeCompare(b, 'de')
    : b.localeCompare(a, 'de');
};

const parse = (s: string): number => {
  return parseFloat(s.replace(/\s+/g, '').replace(',', '.'));
};

declare module 'array2d' {
  function forRow<T>(data: unknown[], rowNumber: number, cb: (cell: T, rowIndex: number, columnIndex: number, data: unknown[]) => void): void;
  function eachColumn<T>(data: unknown[], cb: (col: T[], index: number, data: unknown[]) => void): void;
  function eachRow<T>(data: unknown[], cb: (row: T[], rowIndex: number, data: unknown[]) => void): void;
}

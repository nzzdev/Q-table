import { writable } from 'svelte/store';
import type { QTableSortState } from '@src/interfaces';

export const sortState = writable<QTableSortState>({
  colIndex: null,
  sortDirection: 'asc',
});

import type { ColumnMetaData } from '@src/interfaces';
import { writable } from 'svelte/store';

export const columnInfo = writable([] as ColumnMetaData[])
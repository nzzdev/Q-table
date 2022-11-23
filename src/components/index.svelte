<script lang="ts">
import Footer from '@cps/footer/Footer.svelte';
import Footnotes from '@cps/footnotes/Footnotes.svelte';
import Legend from '@cps/legend/Legend.svelte';
import Methodiek from '@src/components/methodiek/Methodiek.svelte';
import MethodiekStatic from '@src/components/methodiek/MethodiekStatic.svelte';
import Pagination from '@cps/pagination/Pagination.svelte';
import Search from '@cps/search/Search.svelte';
import Table from '@cps/table/Table.svelte';
import { sortRows } from '@src/helpers/sorting';
import type { QTableStateContext, QTableSvelteProperties, Row } from '@src/interfaces';
import { setContext } from 'svelte';
import { sortState } from '@src/stores';
import CardLayout from './card/CardLayout.svelte';

export let componentConfiguration: QTableSvelteProperties;

const { config, initWithCardLayout, rows, footnotes, colorColumn, displayOptions, noInteraction, id, width, frozenRowKey, tableHead } = componentConfiguration;

let { pageSize } = componentConfiguration;

const options = config.options;
let pageIndex = 0;
let page = 0;
let visibleRows: Row[];
let filteredRows: Row[];
let frozenRow: Row | undefined;

if (typeof frozenRowKey === 'number' && rows?.length && rows[frozenRowKey]) {
  frozenRow = rows.splice(frozenRowKey, 1)[0];
  frozenRow.frozen = true;
  // One row will be occupied by frozen row - leave less space for remaining rows
  pageSize -= 1;
}

$: filteredRows = rows;

/**
 * NOTE Questions improvement / refactoring:
 * - Do we need an option to turn sorting off again? Like back to initial status?
 * - Do I need presorting which is set in the editor?
 * - Do we need a default sort direction that can be set in the editor?
*/

sortState.subscribe(state => {
  if (typeof state.colIndex === 'number') {
    const colIndex = state.colIndex;

    filteredRows.sort((a, b) => sortRows(
      a,
      b,
      colIndex,
      tableHead[colIndex].type,
      state.sortDirection,
    ));

    // Re-assign to trigger reactivity.
    // eslint-disable-next-line no-self-assign
    filteredRows = filteredRows;
  }
});

// --- Freeze row ---
$: {
  const currentPageRows: Row[] = filteredRows.slice(pageIndex, pageIndex + pageSize);

  if (frozenRow) {
    currentPageRows.unshift(frozenRow);
  }

  visibleRows = currentPageRows;
}

setContext<QTableStateContext>('state', {
  getState: () => ({
    page,
    pageIndex,
    pageSize,
    rows,
    filteredRows,
  }),
  setPage: (_page: number) => {
    page = _page;
    pageIndex = _page * pageSize;
  },
  setPageSize: _pageSize => (pageSize = _pageSize),
  setFilteredRows: _rows => (filteredRows = _rows),
});

function shouldShowSearch(): boolean {
  return noInteraction !== true && options.showTableSearch === true;
}

function shouldShowTitle(): boolean {
  if (typeof displayOptions.hideTitle === 'boolean') {
    return !displayOptions.hideTitle;
  }

  return true;
}

function shouldShowPagination(): boolean {
  return noInteraction === false && typeof pageSize === 'number' && filteredRows.length > pageSize;
}

// Setup specific class for different devices.
// The reason we use classes instead of media queries is that media queries
// do not get triggered by preview buttons in the editor.
let cls = '';
if (width) {
  if (width > 420) {
    cls = 'qtable-desktop';
  }
}
</script>

<div {id} class="s-q-item qtable-holder {cls}">
  {#if shouldShowTitle()}
    <h3 class="s-q-item__title">{config.title}</h3>
  {/if}

  {#if config.subtitle && config.subtitle !== ''}
    <div class="s-q-item__subtitle">{config.subtitle}</div>
  {/if}

  <div style="overflow-x: auto;">
    {#if shouldShowSearch()}
      <Search />
    {/if}

    {#if shouldShowPagination()}
      <Pagination {page} {pageSize} count={filteredRows.length} />
    {/if}

    {#if options.hideLegend !== true &&
      colorColumn !== null &&
      typeof colorColumn.selectedColumn === 'number' &&
      colorColumn.selectedColumn !== options.minibar.selectedColumn &&
      !initWithCardLayout}
      <Legend {colorColumn} {noInteraction} />
    {/if}

    {#if initWithCardLayout}
      <CardLayout {componentConfiguration} rows={visibleRows} />
    {:else}
      <Table {componentConfiguration} rows={visibleRows} />
    {/if}
  </div>

  {#if footnotes && footnotes.length > 0}
    <Footnotes {footnotes} />
  {/if}

  {#if colorColumn && colorColumn.legend.type === 'numerical'}
    {#if noInteraction}
      <MethodiekStatic legend={colorColumn.legend} />
    {:else}
      <Methodiek legend={colorColumn.legend} />
    {/if}
  {/if}

  <Footer
    notes={config.notes}
    sources={config.sources}
    acronym={config.acronym}
  />
</div>

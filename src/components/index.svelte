<script lang="ts">
import Footer from '@cps/footer/Footer.svelte';
import Footnotes from '@cps/footnotes/Footnotes.svelte';
import Legend from '@cps/legend/Legend.svelte';
import MethodBox from '@cps/methodbox/MethodBox.svelte';
import Pagination from '@cps/pagination/Pagination.svelte';
import Search from '@cps/search/Search.svelte';
import ToggleRowsBtn from '@cps/toggleRowsBtn/ToggleRowsBtn.svelte';
import Table from '@cps/table/Table.svelte';
import CardLayout from './card/CardLayout.svelte';
import { setContext } from 'svelte';
import type { QTableSvelteProperties, QTableStateContext, Row } from '@src/interfaces';

export let componentConfiguration: QTableSvelteProperties;

const { config, initWithCardLayout, rows, footnotes, colorColumn, displayOptions, noInteraction, id, usePagination, width } = componentConfiguration;

let { pageSize } = componentConfiguration;

const originalPageSize = pageSize;
const options = config.options;
let pageIndex = 0;
let page = 0;
let visibleRows: Row[];
let filteredRows: Row[];

$: filteredRows = rows;
$: visibleRows = filteredRows.slice(pageIndex, pageIndex + pageSize);

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

function shouldShowLegend(): boolean {
  return (
    options.hideLegend !== true &&
    colorColumn !== null &&
    colorColumn.selectedColumn !== undefined &&
    colorColumn.selectedColumn !== options.minibar.selectedColumn &&
    !initWithCardLayout
  );
}

function shouldShowSearch(): boolean {
  return noInteraction !== true && options.showTableSearch === true && rows.length > pageSize;
}

function shouldShowTitle(): boolean {
  if (typeof displayOptions.hideTitle === 'boolean') {
    return !displayOptions.hideTitle;
  }

  return true;
}

function shouldShowMoreRowsBtn(): boolean {
  return noInteraction === false && typeof pageSize === 'number' && usePagination !== true && filteredRows.length > pageSize;
}

function shouldShowPagination(): boolean {
  return noInteraction === false && typeof pageSize === 'number' && usePagination === true;
}

// Setup specific class for different devices.
// The reason we use classes instead of media queries is that media queries
// do not get triggered by preview buttons in the editor.
let cls = '';
if (width) {
  if (width <= 420) {
    cls = 'q-table-mobile';
  }
}
</script>

<div {id} class="s-q-item q-table-holder {cls}">
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

    {#if shouldShowLegend() === true}
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
    <MethodBox legend={colorColumn.legend} {noInteraction} />
  {/if}

  {#if shouldShowMoreRowsBtn()}
    <ToggleRowsBtn totalNumberOfRows={rows.length} pageSize={originalPageSize} />
  {/if}

  <Footer notes={config.notes} sources={config.sources} acronym={config.acronym} />
</div>

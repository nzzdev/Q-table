<script lang="ts">
import Cell from '@cps/cell/Cell.svelte';
import Footer from '@cps/footer/Footer.svelte';
import Footnotes from '@cps/footnotes/Footnotes.svelte';
import Legend from '@cps/legend/Legend.svelte';
import MethodBox from '@cps/methodbox/MethodBox.svelte';
import MinibarBox from '@cps/minibar/MinibarBox.svelte';
import MinibarValue from '@cps/minibar/MinibarValue.svelte';
import MixedMinibars from '@cps/minibar/MixedMinibars.svelte';
import Pagination from '@cps/pagination/Pagination.svelte';
import Search from '@cps/search/Search.svelte';
import Thead from '@cps/thead/Thead.svelte';
import ToggleRowsBtn from '@cps/toggleRowsBtn/ToggleRowsBtn.svelte';
import { setContext } from 'svelte';
import type { QTableSvelteProperties, QTableStateContext, QTableDataFormatted } from '@src/interfaces';

export let componentConfiguration: QTableSvelteProperties;

const {
  config,
  item,
  initWithCardLayout,
  tableHead,
  rows,
  minibar,
  footnotes,
  colorColumn,
  displayOptions,
  noInteraction,
  id,
  usePagination,
  hideTableHeader,
} = componentConfiguration;

let { pageSize } = componentConfiguration;

const originalPageSize = pageSize;
const options = config.options;
let pageIndex = 0;
let page = 0;
let visibleRows: QTableDataFormatted[][];
let filteredRows: QTableDataFormatted[][];

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
  return noInteraction !== true && options.showTableSearch === true && rows.length > 16;
}

function shouldShowTitle(): boolean {
  if (typeof displayOptions.hideTitle === 'boolean') {
    return !displayOptions.hideTitle;
  }

  return true;
}

function isMinibarColumn(colIndex: number): boolean {
  return (
    options.minibar && options.minibar.selectedColumn !== null && options.minibar.selectedColumn !== undefined && options.minibar.selectedColumn === colIndex
  );
}

function shouldShowMoreRowsBtn(): boolean {
  return noInteraction === false && typeof pageSize === 'number' && usePagination !== true && filteredRows.length > pageSize;
}
</script>

<div {id} class="s-q-item q-table" class:q-table--card-layout={initWithCardLayout} style="opacity: 0;">
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

    {#if noInteraction === false && typeof pageSize === 'number' && usePagination === true}
      <Pagination {page} {pageSize} count={filteredRows.length} />
    {/if}

    {#if shouldShowLegend() === true}
      <Legend {colorColumn} {noInteraction} />
    {/if}

    <table class="q-table__table">
      {#if hideTableHeader !== true}
        <Thead {tableHead} {minibar} {initWithCardLayout} />
      {/if}

      <tbody class="s-font-note">
        {#each visibleRows as row, rowIndex}
          <tr>
            {#each row as cell, colIndex}
              {#if initWithCardLayout === false && isMinibarColumn(colIndex)}
                {#if minibar && minibar.type === 'positive'}
                  <MinibarValue {item} tableData={rows} {minibar} {cell} {colIndex} {rowIndex} {initWithCardLayout} />
                  <MinibarBox {item} {minibar} {colIndex} {rowIndex} {initWithCardLayout} />
                {:else if minibar && minibar.type === 'negative'}
                  <MinibarBox {item} {minibar} {colIndex} {rowIndex} {initWithCardLayout} />
                  <MinibarValue {item} tableData={rows} {minibar} {cell} {colIndex} {rowIndex} {initWithCardLayout} />
                {:else if minibar && minibar.type === 'mixed'}
                  <MixedMinibars {item} tableData={rows} {minibar} {cell} {rowIndex} {colIndex} {initWithCardLayout} />
                {:else}
                  <Cell {item} {cell} {tableHead} {colorColumn} {colIndex} {rowIndex} {initWithCardLayout} />
                {/if}
              {:else}
                <Cell {item} {cell} {tableHead} {colorColumn} {colIndex} {rowIndex} {initWithCardLayout} />
              {/if}
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
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

  <Footer notes={config.notes} sources={config.sources} />
</div>

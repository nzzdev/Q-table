<script lang="ts">
import Cell from './cell/Cell.svelte';
import ColoredCell from './cell/ColoredCell.svelte';
import MinibarCell from './cell/MinibarCell.svelte';
import Thead from './thead/Thead.svelte';
import type { QTableSvelteProperties, Row } from '@src/interfaces';

export let componentConfiguration: QTableSvelteProperties;
export let rows: Row[];

const { initWithCardLayout, tableHead, minibar, colorColumn, hideTableHeader } = componentConfiguration;
</script>

<table class="qtable">
  {#if hideTableHeader !== true}
    <Thead {tableHead} {minibar} {initWithCardLayout} />
  {/if}

  <tbody class="s-font-note">
    {#each rows as row (row.key)}
      <tr class:qtable-tr-frozen={row.frozen}>
        {#each row.cells as cell, colIndex}

          {#if minibar?.columnIndex === colIndex}
            <MinibarCell {cell} {minibar} rowIndex={row.key} />
          {:else if colorColumn?.selectedColumn === colIndex}
            <ColoredCell {cell} {colorColumn} rowIndex={row.key} />
          {:else}
            <Cell {cell} />
          {/if}

        {/each}
      </tr>
    {/each}
  </tbody>
</table>

<style lang="scss">
// the high specificty is needed because nzz frontends apply
// highly specific table styles that we need to overwrite.
:global(.qtable-holder) {
  :global(.qtable) {
    border-collapse: collapse;
    border: none;
    margin: 0;
    padding: 0;
    width: 100%;
    table-layout: auto;
    empty-cells: show;

    th,
    td {
      padding: 10px 4px;
      vertical-align: top;
      border: none !important;
      font-size: unset;
      line-height: unset;
      font-weight: unset;
    }

    thead {
      background: unset;
    }

    tbody tr,
    thead {
      border-width: 0 0 1px 0;
      border-style: solid;
      border-color: #e9e9ee;
    }

    :global(.qtable-tr-frozen) {
      background-color: #f4f4f4;
      border-bottom: 2px solid #000 !important;
      border-top: 2px solid #000 !important;
    }

    // TODO: Discuss later.
    // when the text-column follows a numeric-column, the text-column should have a padding for spacing reasons

  // .q-table-holder:not(.q-table--card-layout) .q-table__cell--numeric:not(#q-table-minibar-header) + .q-table__cell:not(.q-table__cell--numeric) {
  //   padding-left: 20px;
  // }
  }
}
</style>

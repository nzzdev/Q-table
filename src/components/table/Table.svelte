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

<table class="q-table">
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
:global(.q-table) {
  :global(.qtable-tr-frozen) {
    background-color: #f4f4f4;
    border-bottom: 2px solid #000 !important;
    border-top: 2px solid #000 !important;
  }
}
</style>

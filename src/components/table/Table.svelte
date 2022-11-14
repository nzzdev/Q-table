<script lang="ts">
import Cell from '@cps/cell/Cell.svelte';
import ColoredCell from '@cps/cell/ColoredCell.svelte';
import MinibarCell from '@cps/cell/MinibarCell.svelte';
import Thead from '@cps/thead/Thead.svelte';
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
      <tr class:q-table-state-frozen={row.frozen}>
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

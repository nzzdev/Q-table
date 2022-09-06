<script lang="ts">
import Cell from '@cps/cell/Cell.svelte';
import MinibarBox from '@cps/minibar/MinibarBox.svelte';
import MinibarValue from '@cps/minibar/MinibarValue.svelte';
import MixedMinibars from '@cps/minibar/MixedMinibars.svelte';
import Thead from '@cps/thead/Thead.svelte';
import type { QTableSvelteProperties, QTableDataFormatted } from '@src/interfaces';

export let componentConfiguration: QTableSvelteProperties;
export let rows: QTableDataFormatted[][];

const { config, item, initWithCardLayout, tableHead, minibar, colorColumn, hideTableHeader } = componentConfiguration;
const options = config.options;

function isMinibarColumn(colIndex: number): boolean {
  return (
    options.minibar && options.minibar.selectedColumn !== null && options.minibar.selectedColumn !== undefined && options.minibar.selectedColumn === colIndex
  );
}
</script>

<table class="q-table">
  {#if hideTableHeader !== true}
    <Thead {tableHead} {minibar} {initWithCardLayout} />
  {/if}

  <tbody class="s-font-note">
    {#each rows as row, rowIndex}
      <tr>
        {#each row as cell, colIndex}
          {#if isMinibarColumn(colIndex)}
            {#if minibar && minibar.type === 'positive'}
              <MinibarValue {item} tableData={rows} {minibar} {cell} {colIndex} {rowIndex} />
              <MinibarBox {item} {minibar} {colIndex} {rowIndex} />
            {:else if minibar && minibar.type === 'negative'}
              <MinibarBox {item} {minibar} {colIndex} {rowIndex} />
              <MinibarValue {item} tableData={rows} {minibar} {cell} {colIndex} {rowIndex} />
            {:else if minibar && minibar.type === 'mixed'}
              <MixedMinibars {item} tableData={rows} {minibar} {cell} {rowIndex} {colIndex} />
            {:else}
              <Cell {item} {cell} {tableHead} {colorColumn} {colIndex} {rowIndex} />
            {/if}
          {:else}
            <Cell {item} {cell} {tableHead} {colorColumn} {colIndex} {rowIndex} />
          {/if}
        {/each}
      </tr>
    {/each}
  </tbody>
</table>

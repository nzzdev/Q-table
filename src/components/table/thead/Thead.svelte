<script lang="ts">
import CellLabel from '../cell/CellLabel.svelte';
import SortArrow from '@cps/svg/SortArrow.svelte';
import type { Thead } from '@src/interfaces';
import type { Minibar } from '@helpers/minibars';

export let minibar: Minibar | null = null;
export let tableHead: Thead[] = [];

import { sortState } from '@src/stores';

function getAttributes(colIndex: number): Attribute {
  let classes = '';
  let colspan = 0;

  if (minibar !== null) {
    const selectedColumn = minibar.settings.selectedColumn;

    if (selectedColumn === colIndex) {
      classes = 'q-table-minibar-header';
    }
  }

  return { colspan, classes };
}

const onSort = (colIndex: number): void => {
  if ($sortState.colIndex === colIndex) { // Toggle direction on same column
    sortState.set({
      colIndex,
      sortDirection: $sortState.sortDirection === 'asc' ? 'desc' : 'asc',
    });
  } else { // Changing column.
    sortState.set({
      colIndex,
      sortDirection: 'asc',
    });
  }
}

interface Attribute {
  colspan: number;
  classes: string;
}
</script>

{#if tableHead.length > 0}
  <thead class="s-font-note s-font-note--strong">
    {#each tableHead as head, colIndex}
      <th
        class="qtable-th qtable-th-{head.type} {head.classes.join(' ')} {getAttributes(colIndex).classes}">

        <CellLabel label={head.value} footnote={head.footnote} />

        {#if head.sortable}
          {#if $sortState.colIndex === colIndex}
            <span on:click={() => onSort(colIndex)}>
              <SortArrow
                sortAscending={$sortState.sortDirection === 'asc'}
                sortActive= {$sortState.colIndex === colIndex} />
            </span>
          {:else}
            <span on:click={() => onSort(colIndex)}>
              <SortArrow />
            </span>
          {/if}
        {/if}
      </th>
    {/each}
  </thead>
{/if}

<style lang="scss">
:global(.qtable-th) {
  text-align: left;
}

:global(.q-table-minibar-header) {
  text-align: center;
}
</style>
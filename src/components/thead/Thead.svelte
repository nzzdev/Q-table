<script lang="ts">
import type { Minibar } from '@helpers/minibars';
import type { Thead } from '@src/interfaces';
import SortArrow from '../svg/SortArrow.svelte';

export let initWithCardLayout = false;
export let minibar: Minibar | null = null;
export let tableHead: Thead[] = [];

import { sortState } from '@src/stores';

function getAttributes(colIndex: number): Attribute {
  let classes = '';
  let colspan = 0;

  if (minibar !== null) {
    const selectedColumn = minibar.settings.selectedColumn;
    const type = minibar.type;

    if (selectedColumn === colIndex) {
      classes = 'q-table-minibar-header';

      if (type !== 'mixed' && !initWithCardLayout) {
        colspan = 2;
      } else if (type === 'mixed') {
        colspan = 0;
      }
    }
  }

  return { colspan, classes };
}

const onSort = (colIndex: number): void => {
  console.log($sortState.colIndex, colIndex);

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
        class="q-table__cell q-table-cell--head q-table__cell--{head.type} {head.classes.join(' ')} {getAttributes(colIndex).classes}"
        colspan={getAttributes(colIndex).colspan}>

        <span>
          {head.value}

          {#if head.footnote !== ''}
            <span class="q-table-footnote-annotation">
              {head.footnote}
            </span>
          {/if}
        </span>

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

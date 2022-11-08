<script lang="ts">
import type { Minibar } from '@helpers/minibars';
import type { Cell, ColumnMetaData } from '@src/interfaces';
import { columnInfo } from '@src/stores/columnInfo';
import { sortingColumnIndex } from '@src/stores/sortingColumnIndex';
import SortArrow from '../svg/SortArrow.svelte';

export let initWithCardLayout = false;
export let minibar: Minibar | null = null;
export let tableHead: Cell[] = [];

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
  if (colIndex !== $sortingColumnIndex) 
    sortingColumnIndex.set(colIndex);
  else {
    const currentColumn = $columnInfo[colIndex]
    // toggle sort direction
    currentColumn.sortDirection = currentColumn.sortDirection === 'asc' ? 'dsc' : 'asc'
    const columnInfoTemp: ColumnMetaData[] = [...$columnInfo]
    columnInfoTemp[colIndex] = currentColumn;
    columnInfo.set(columnInfoTemp)
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
        {#if head.footnote}
          <span data-annotation={head.footnote.value} class="q-table-footnote-annotation">{head.value}</span>
        {:else if head.value}
          {head.value}
        {/if}
        {#if $columnInfo[colIndex] && $columnInfo[colIndex].sortable}
          <span on:click={() => onSort(colIndex)}>
            <SortArrow
              sortAscending={$columnInfo[colIndex].sortDirection === 'asc'}
              sortActive= {$sortingColumnIndex === colIndex} />
          </span>
        {/if}
      </th>
    {/each}
  </thead>
{/if}

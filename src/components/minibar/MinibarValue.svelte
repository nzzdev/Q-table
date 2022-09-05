<script lang="ts">
import { MINIBAR_TYPE, type Minibar } from 'src/helpers/minibars';
import type { QTableConfig, QTableDataFormatted } from 'src/interfaces';

export let item: QTableConfig;
export let tableData: QTableDataFormatted[][];
export let minibar: Minibar;
export let cell: QTableDataFormatted;
export let colIndex: number;
export let rowIndex: number;
export let initWithCardLayout: boolean;

// With v7 this is most likely not necessary anymore as I render always a cell if there is
// a card layout. But need to investigate more later.
function getDataLabelAttribute(): string {
  let dataLabel = '';

  if (item.options.hideTableHeader !== true) {
    dataLabel += tableData[0][colIndex].value;
    if ((item.options.cardLayout || item.options.cardLayoutIfSmall) && tableData[0][colIndex].footnote && rowIndex === 0) {
      const footnote = tableData[0][colIndex].footnote;

      if (footnote) {
        dataLabel += footnote.unicode;
      }
    }
  }

  return dataLabel;
}

function getMinibarDataAttribute(): MINIBAR_TYPE {
  if (item.options.minibar.selectedColumn === colIndex && !initWithCardLayout) {
    return minibar.type;
  }

  return MINIBAR_TYPE.EMPTY;
}

function getCellClass(): string {
  let classes = `q-table__cell q-table__cell--${cell.type} ${cell.classes.join(' ')} `;

  if (item.options.minibar.selectedColumn === colIndex && !initWithCardLayout) {
    classes += 'q-table-minibar-cell--value';
  }

  return classes;
}

function getCellStyles(): string {
  let styles = '';

  if (item.options.minibar.selectedColumn === colIndex && !initWithCardLayout) {
    if (minibar.type === 'positive') {
      styles += 'padding-left: 12px';
    } else if (minibar.type === 'negative') {
      styles = 'padding-right: 12px;';
    }
  }

  return styles;
}
</script>

<td data-label={getDataLabelAttribute()} data-minibar={getMinibarDataAttribute()} class={getCellClass()} style={getCellStyles()}>
  {#if cell.footnote}
    <span data-annotation={cell.footnote.value} class="q-table-footnote-annotation">
      {#if cell.value}
        {cell.value}
      {/if}
    </span>
  {:else if cell.value}
    {cell.value}
  {/if}
</td>

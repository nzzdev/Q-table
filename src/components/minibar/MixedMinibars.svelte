<script lang="ts">
import type { Minibar } from 'src/helpers/minibars';
import type { QTableConfig, QTableDataFormatted } from 'src/interfaces';

export let item: QTableConfig;
export let tableData: QTableDataFormatted[][];
export let cell: QTableDataFormatted;
export let minibar: Minibar;
export let colIndex: number;
export let rowIndex: number;
export let initWithCardLayout: boolean;

const options = item.options;
const { cardLayout, cardLayoutIfSmall } = options;

// this has to be done because the tableData will be sliced before iterating
rowIndex += 1;

function getDataLabelAttribute(): string {
  let dataLabel = '';

  if (item.options.hideTableHeader !== true) {
    dataLabel = tableData[0][colIndex].value || '';
    const footnote = tableData[0][colIndex].footnote;

    if ((cardLayout || cardLayoutIfSmall) && footnote && rowIndex === 0) {
      dataLabel += footnote.unicode;
    }
  }

  return dataLabel;
}

function getMinibarColor(): string {
  return minibar.values[rowIndex].type === 'positive' ? minibar.barColor.positive.colorCode : minibar.barColor.negative.colorCode;
}

function getMinibarClasses(): string {
  let classes = '';

  if (options.minibar.selectedColumn === colIndex && !initWithCardLayout) {
    classes = 'q-table-minibar--mixed';
  } else {
    classes = `q-table__cell--${cell.type}`;
  }

  return classes;
}

function getFootnoteClasses(): string {
  if (cell.footnote && minibar.values[rowIndex].type === 'positive') {
    return cell.footnote.class || '';
  }

  return '';
}

function getMinibarClassName(): string {
  return minibar.values[rowIndex].type === 'positive' ? minibar.barColor.positive.className : minibar.barColor.negative.className;
}
</script>

<td data-label={getDataLabelAttribute()} data-minibar={minibar.type} class="q-table__cell {cell.classes.join(' ')} {getMinibarClasses()}">
  {#if item.options.minibar.selectedColumn === colIndex && !initWithCardLayout}
    <div
      data-minibar={minibar.values[rowIndex].type}
      class="q-table-minibar-alignment--{minibar.values[rowIndex].type} q-table__cell q-table__cell--{cell.type} {getFootnoteClasses()}">
      {#if cell.footnote}
        <span data-annotation={cell.footnote.value} class="q-table-footnote-annotation">
          {#if cell.value}
            {cell.value}
          {/if}
        </span>
      {:else if cell.value}
        {cell.value}
      {/if}
    </div>
  {:else if cell.footnote}
    <span data-annotation={cell.footnote.value} class="q-table-footnote-annotation">
      {#if cell.value}
        {cell.value}
      {/if}
    </span>
  {:else if cell.value}
    {cell.value}
  {/if}
  {#if item.options.minibar.selectedColumn === colIndex && !initWithCardLayout}
    {#if minibar.values[rowIndex].type !== 'empty'}
      <div
        data-minibar={minibar.values[rowIndex].type}
        class="q-table-minibar-bar--{minibar.values[rowIndex].type} q-table-minibar--{minibar.values[rowIndex].type} {getMinibarClassName()}"
        style="width: {minibar.values[rowIndex].value}%; background-color: {getMinibarColor()}" />
    {/if}
  {/if}
</td>

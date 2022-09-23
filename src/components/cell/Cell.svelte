<script lang="ts">
import type { ColorColumn } from '@helpers/colorColumn';
import type { QTableConfig, QTableDataFormatted } from '@src/interfaces';

export let item: QTableConfig;
export let cell: QTableDataFormatted;
export let colorColumn: ColorColumn | null;
export let rowIndex: number;
export let colIndex: number;
export let tableHead: QTableDataFormatted[];

let styles: CellStyle;

$: styles = getCellStyles(colIndex, rowIndex);

function getDataLabel(colIndex: number): string {
  let dataLabel = '';
  const footnote = tableHead[colIndex].footnote;

  if (tableHead[colIndex] && tableHead[colIndex].value) {
    if (item.options.hideTableHeader !== true) {
      dataLabel += tableHead[colIndex].value;
    }

    if (footnote !== undefined) {
      dataLabel += footnote.unicode;
    }
  }

  return dataLabel;
}

function getCellStyles(colIndex: number, rowIndex: number): CellStyle {
  let classes = `q-table__cell q-table__cell--${cell.type} ${cell.classes.join(' ')} `;
  let styles = '';

  if (colorColumn !== null) {
    if (colorColumn.selectedColumn === colIndex) {
      if (colorColumn.colors[rowIndex].customColor) {
        styles += `background-color: ${colorColumn.colors[rowIndex].customColor};`;
      } else {
        classes += colorColumn.colors[rowIndex].colorClass;
        styles += 'background-color: currentColor;';
      }
    }
  }

  return { class: classes, style: styles };
}

interface CellStyle {
  class: string;
  style: string;
}
</script>

<td data-label={getDataLabel(colIndex)} class={styles.class} style={styles.style}>
  {#if colorColumn !== null && colorColumn.selectedColumn === colIndex}
    {#if cell.footnote}
      <span class={colorColumn.colors[rowIndex].textColor}>
        {#if colorColumn.colorColumnType === 'numerical'}
          {#if !colorColumn.formattedValues[rowIndex]}
            --
          {:else}
            {colorColumn.formattedValues[rowIndex]}
          {/if}
        {:else if cell.value}
          {cell.value}
        {/if}
        {#if cell.footnote.value}
          <span class="q-table-footnote-annotation--colorColumn {colorColumn.colors[rowIndex].textColor}">
            <sup>{cell.footnote.value}</sup>
          </span>
        {/if}
      </span>
    {:else}
      <span class={colorColumn.colors[rowIndex].textColor}>
        {#if colorColumn.colorColumnType === 'numerical'}
          {#if !colorColumn.formattedValues[rowIndex]}
            --
          {:else}
            {colorColumn.formattedValues[rowIndex]}
          {/if}
        {:else if cell.value}
          {cell.value}
        {/if}
      </span>
    {/if}
  {:else if cell.footnote}
    <span data-annotation={cell.footnote.value} class="q-table-footnote-annotation">
      {#if cell.value}
        {cell.value}
      {/if}
    </span>
  {:else if cell.value}
    <span>
      {cell.value}
    </span>
  {/if}
</td>

<script lang="ts">
import type { ColorColumn } from '@helpers/colorColumn';
import type { QTableConfig, Cell, Thead } from '@src/interfaces';

export let item: QTableConfig;
export let cell: Cell;
export let colorColumn: ColorColumn | null;
export let rowIndex: number;
export let colIndex: number;
export let tableHead: Thead[];

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
      if (colorColumn.colors[rowIndex]) {
        if (colorColumn.colors[rowIndex].customColor) {
          styles += `background-color: ${colorColumn.colors[rowIndex].customColor};`;
        } else {
          classes += colorColumn.colors[rowIndex].colorClass;
          styles += 'background-color: currentColor;';
        }
      } else {
        console.log('Failed to get color for row', rowIndex, colIndex);
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
  {#if colorColumn?.selectedColumn === colIndex}
      <span class={colorColumn.colors[rowIndex]?.textColor}>
          {cell.label}

        {#if cell.footnote?.value}
          <span class="q-table-footnote-annotation q-table-footnote-annotation-colored-column {colorColumn.colors[rowIndex].textColor}">
            {cell.footnote.value}
          </span>
        {/if}
      </span>
  {:else}
    <span>
      {cell.label}

      {#if cell.footnote?.value}
          <span class="q-table-footnote-annotation">
            {cell.footnote.value}
          </span>
        {/if}
    </span>
  {/if}
</td>

<script lang="ts">
import type { QTableSvelteProperties, QTableDataFormatted } from '@src/interfaces';
export let componentConfiguration: QTableSvelteProperties;

const { tableHead } = componentConfiguration;
export let rows: QTableDataFormatted[][];

function getHead(colIndex: number): string {
  const value = tableHead[colIndex].value;
  let head = '';

  if (value) {
    head += value;
  }

  return head;
}

function getFootnote(colIndex: number): string {
  if (tableHead[colIndex].footnote !== undefined) {
    const uni = tableHead[colIndex].footnote?.unicode;
    return `<span class="q-table--card-head-footnote">${uni}</span>`;
  }

  return '';
}

function getCellFootnote(cell: QTableDataFormatted): string {
  if (cell.footnote) {
    const uni = cell.footnote.unicode;
    return `<span class="q-table--card-value-footnote">${uni}</span>`;
  }

  return '';
}
</script>

<div class="q-table--card-layout s-font-note">
  {#each rows as row}
    <div class="q-table--card-row">
      {#each row as cell, colIndex}
        <div class={`q-table--card-cell ${cell.classes.join(' ')} `}>
          <span class="q-table--card-cell-title">
            {getHead(colIndex)}{@html getFootnote(colIndex)}
          </span>

          <span class="q-table--card-cell-value">{cell.value}{@html getCellFootnote(cell)}</span>
        </div>
      {/each}
    </div>
  {/each}
</div>

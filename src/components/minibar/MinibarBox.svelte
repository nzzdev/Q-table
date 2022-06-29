<script lang="ts">
import type { Minibar } from 'src/helpers/minibars';
import type { QTableConfig } from 'src/interfaces';

export let item: QTableConfig;
export let minibar: Minibar | null;
export let rowIndex: number;
export let colIndex: number;
export let initWithCardLayout: boolean;

// this has to be done because the tableData will be sliced before iterating
rowIndex += 1;

function getBarStyle(): string {
  let style = '';

  if (minibar) {
    if (minibar.values[rowIndex].type !== 'empty') {
      style = `width: ${minibar.values[rowIndex].value}%;`;
      if (minibar.barColor.positive.colorCode || minibar.barColor.negative.colorCode) {
        if (minibar.barColor.positive.colorCode) {
          style += `background-color: ${minibar.barColor.positive.colorCode};`;
        }
        if (minibar.barColor.negative.colorCode) {
          style += `background-color: ${minibar.barColor.negative.colorCode};`;
        }
      }
    }
  }

  return style;
}

function getCellStyle(): string {
  let style = '';

  if (minibar) {
    // check for type and return accordingly
    if (minibar.type === 'positive') {
      style = 'padding-right: 12px !important;';
    } else if (minibar.type === 'negative') {
      style = 'padding-left: 12px; padding-right: 0px !important;';
    }
  }

  return style;
}

function getMinibarClassName(): string {
  if (minibar) {
    return minibar.values[rowIndex].type === 'positive' ? minibar.barColor.positive.className : minibar.barColor.negative.className;
  }

  return '';
}
</script>

{#if minibar && item.options.minibar.selectedColumn === colIndex && !initWithCardLayout}
  <td class="q-table-minibar-cell" data-minibar={minibar.type} style={getCellStyle()}>
    <div class="q-table-minibar-bar--{minibar.values[rowIndex].type} {getMinibarClassName()}" style={getBarStyle()} />
  </td>
{/if}

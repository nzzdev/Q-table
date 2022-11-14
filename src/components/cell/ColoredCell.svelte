<script lang="ts">
import Td from '@cps/table/Td.svelte';
import type { ColorColumn } from '@helpers/colorColumn';
import type { Cell } from '@src/interfaces';

export let cell: Cell;
export let colorColumn: ColorColumn;
export let rowIndex: number;

let styles: CellStyle;

$: styles = getCellStyles(rowIndex);

function getCellStyles(rowIndex: number): CellStyle {
  let classes = [];
  let styles = [];

  if (colorColumn.colors[rowIndex]) {
    if (colorColumn.colors[rowIndex].customColor) {
      styles.push(`background-color: ${colorColumn.colors[rowIndex].customColor}`);
    } else {
      classes.push(colorColumn.colors[rowIndex].colorClass);
      styles.push('background-color: currentColor');
    }
  } else {
    console.log('Failed to get cell color for row', rowIndex);
  }

  return { classes, styles };
}

interface CellStyle {
  classes: string[];
  styles: string[];
}
</script>

<Td type={cell.type} classes={styles.classes} styles={styles.styles}>
  <span class={colorColumn.colors[rowIndex]?.textColor}>
    {cell.label}

    {#if cell.footnote !== ''}
      <span class="q-table-footnote-annotation q-table-footnote-annotation-colored-column {colorColumn.colors[rowIndex].textColor}">
        {cell.footnote}
      </span>
    {/if}
  </span>
</Td>

<style lang="scss">
</style>

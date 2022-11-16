<script lang="ts">
import Footnote from './Footnote.svelte';
import Td from '@cps/table/Td.svelte';
import type { ColorColumn } from '@helpers/colorColumn';
import type { Cell } from '@src/interfaces';
import CellLabel from './CellLabel.svelte';

export let cell: Cell;
export let colorColumn: ColorColumn;
export let rowIndex: number;

let styles: CellStyle;

$: styles = getCellStyles(rowIndex);

function getCellStyles(rowIndex: number): CellStyle {
  let classes = [];
  let styles = [];
  const colors = colorColumn.colors[rowIndex];

  if (colors) {
    if (colors.customColor !== '') {
      styles.push(`background-color: ${colorColumn.colors[rowIndex].customColor}`);
    } else if (colors.colorClass !== '') {
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
  <CellLabel cls={colorColumn.colors[rowIndex].textColor} label={cell.label} footnote={cell.footnote} />
</Td>

<style lang="scss">
</style>

<script lang="ts">
import CellLabel from './CellLabel.svelte';
import { MINIBAR_TYPE } from 'src/helpers/minibars';
import MinibarBox from '@cps/minibar/MinibarBox.svelte';
import Td from '../Td.svelte';

import type { Cell } from 'src/interfaces';
import type { Minibar } from 'src/helpers/minibars';

export let minibar: Minibar;
export let cell: Cell;
export let rowIndex: number;

const classes = ['qtable-minibar-cell'];
let barType = MINIBAR_TYPE.EMPTY;

// Check what bartype we have.
if (cell.value < 0) {
  barType = MINIBAR_TYPE.NEGATIVE;
} else if ( cell.value > 0) {
  barType = MINIBAR_TYPE.POSITIVE;
}

classes.push(`qtable-minibar-cell-${barType}`);

const posClrCode = minibar.barColor.positive.colorCode
const posClrClass = minibar.barColor.positive.className;

const negClrCode = minibar.barColor.negative.colorCode
const negClrClass = minibar.barColor.negative.className;

const barWidth = minibar.values[rowIndex];
</script>

<Td type={cell.type} {classes}>
  {#if cell.value < 0}
    <div class="qtable-minibar-holder">
      <MinibarBox type={MINIBAR_TYPE.NEGATIVE} clrCode={negClrCode} clrClass={negClrClass} width={barWidth} />
    </div>
  {/if}

  <CellLabel label={cell.label} footnote={cell.footnote} />

  {#if cell.value > 0}
    <div class="qtable-minibar-holder">
      <MinibarBox type={MINIBAR_TYPE.POSITIVE}  clrCode={posClrCode} clrClass={posClrClass} width={barWidth} />
    </div>
  {/if}
</Td>

<style lang="scss">
:global(.qtable-minibar-cell) {
  align-items: center;
  background-color: hsla(0,0%,78%,.15);
  display: flex;
  min-width: 90px;
}

:global(.qtable-minibar-holder) {
  position: relative;
  width: 50%;
}

:global(.qtable-minibar-cell-empty) {
  justify-content: center;
}

:global(.qtable-minibar-cell-positive) {
  justify-content: end;

  :global(.qtable-minibar-holder) {
    // if we have double digit footnotes this margin
    // will not be enough.
    // But this almost never happens.
    margin-left: 10px;
  }
}

:global(.qtable-minibar-cell-negative) {
  justify-content: start;

  :global(.qtable-minibar-holder) {
    margin-right: 5px;
  }
}

:global(.qtable-desktop) {
  :global(.qtable-minibar-cell) {
    min-width: 140px;
  }
}
</style>

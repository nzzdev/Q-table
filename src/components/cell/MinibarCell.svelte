<script lang="ts">
import { MINIBAR_TYPE } from 'src/helpers/minibars';
import MinibarBox from '@cps/minibar/MinibarBox.svelte';
import Td from '@cps/table/Td.svelte';

import type { Cell } from 'src/interfaces';
import type { Minibar } from 'src/helpers/minibars';

export let minibar: Minibar;
export let cell: Cell;
export let rowIndex: number;

const classes = ['q-table-minibar-cell'];
</script>

<Td type={cell.type} {classes}>
  {#if cell.value < 0}
    <MinibarBox type={MINIBAR_TYPE.NEGATIVE} {rowIndex} {minibar} />
  {/if}

  <span>
    {cell.label}

    {#if cell.footnote !== ''}
        <span class="q-table-footnote-annotation">
          {cell.footnote}
        </span>
    {/if}
  </span>

  {#if cell.value > 0}
    <MinibarBox type={MINIBAR_TYPE.POSITIVE} {rowIndex} {minibar} />
  {/if}
</Td>

<style lang="scss">

:global(.q-table-minibar-cell) {
  background-color: rgba(200, 200, 200, 0.15);
  min-width: 140px;
}
</style>

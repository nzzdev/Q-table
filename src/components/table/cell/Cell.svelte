<script lang="ts">
import Td from '@cps/table/Td.svelte';
import CellLabel from './CellLabel.svelte';
import type { Cell } from '@src/interfaces';

export let cell: Cell;
</script>

<Td type={cell.type} classes={cell.classes}>
  {#if cell.type === 'country-flag-emoji'}
    <img src={cell.label} alt="country flag {cell.value}" />
  {:else}
    <CellLabel label={cell.label} footnote={cell.footnote} />
  {/if}
</Td>

<style lang="scss">
:global(.qtable-cell-country-flag-emoji) {
  img {
    width: 16px;
  }
}
</style>

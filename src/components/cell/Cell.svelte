<script lang="ts">
import Td from '@cps/table/Td.svelte';
import type { Cell } from '@src/interfaces';
export let cell: Cell;
</script>

<Td type={cell.type}>
  <span>
    {cell.label}

    {#if cell.footnote !== ''}
        <span class="q-table-footnote-annotation">
          {cell.footnote}
        </span>
    {/if}
  </span>
</Td>

<style lang="scss">
</style>

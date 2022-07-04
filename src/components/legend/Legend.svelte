<script lang="ts">
import NumericalLegend from './NumericalLegend.svelte';
import CategoricalLegend from './CategoricalLegend.svelte';
import type { ColorColumn } from '@helpers/colorColumn';

export let colorColumn: ColorColumn | null;
export let noInteraction: boolean;
</script>

{#if colorColumn !== null}
  <div class="q-table-legend-container q-table-legend-container--desktop">
    {#if colorColumn.colorColumnType === 'numerical'}
      <NumericalLegend {colorColumn} {noInteraction} />
    {:else}
      <CategoricalLegend {colorColumn} {noInteraction} />
    {/if}
  </div>
{/if}

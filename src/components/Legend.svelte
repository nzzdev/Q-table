<script lang="ts">
import NumericalLegend from "./legends/NumericalLegend.svelte";
import CategoricalLegend from "./legends/CategoricalLegend.svelte";
import type { ColorColumn } from "../helpers/colorColumn";

export let colorColumn: ColorColumn | null;
export let noInteraction: boolean;
</script>

{#if colorColumn !== null}
  {#if colorColumn.colorColumnType === "numerical"}
    <NumericalLegend {colorColumn} {noInteraction} />
  {:else}
    <CategoricalLegend {colorColumn} {noInteraction} />
  {/if}
{/if}

<script lang="ts">
import type { ColorColumn } from '../../helpers/colorColumn';
import type { CategoricalLegend } from '../../helpers/colorColumnLegend';

export let colorColumn: ColorColumn;
export let noInteraction: boolean;

const legendData = colorColumn.legend as CategoricalLegend;
</script>

<div class="q-table-colorColumn-legend--categorical">
  <div class="s-legend-icon-label">
    {#each legendData.categories as category}
      {#if category.color.customColor}
        <div class="s-legend-item-label__item" style="color: {category.color.customColor}">
          <div class="s-legend-item-label__item__icon s-legend-item-label__item__icon--default" />
          <div class="s-legend-item-label__item__label">{category.label}</div>
        </div>
      {:else}
        <div class="s-legend-item-label__item {category.color.colorClass}">
          <div class="s-legend-item-label__item__icon s-legend-item-label__item__icon--default" />
          <div class="s-legend-item-label__item__label">{category.label}</div>
        </div>
      {/if}
    {/each}
  </div>

  {#if legendData.hasNullValues}
    <div class="s-legend-icon-label">
      <div class="s-legend-item-label__item">
        <svg
          width="11"
          height="11"
          class="s-legend-item-label__item__icon q-table-colorColumn-legend-info-icon"
          class:q-table-colorColumn-legend-info-icon--interactive={!noInteraction}
          class:q-table-colorColumn-legend-info-icon--no-interactive={noInteraction}>
          <rect width="11" height="11" class="s-color-gray-4" fill="white" stroke="currentColor" stroke-width="2" />
        </svg>
        <div class="s-legend-item-label__item__label">Keine Daten</div>
      </div>
    </div>
  {/if}
</div>

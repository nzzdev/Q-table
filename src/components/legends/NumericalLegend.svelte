<script lang="ts">
import type { ColorColumn } from '../../helpers/colorColumn';
import type { Bucket, NumericalLegend } from '../../helpers/colorColumnLegend';
export let colorColumn: ColorColumn;
export let noInteraction: boolean;

const legendData = colorColumn.legendData as NumericalLegend;
const { buckets, hasNullValues, hasSingleValueBucket, labelLegend, maxValue, minValue } = legendData;

function getAspectXValue(bucket: Bucket, minVal: number, maxVal: number): number {
  return ((bucket.from - minVal) * 100) / (maxVal - minVal);
}

function getBucketWidth(bucket: Bucket, minVal: number, maxVal: number): number {
  return ((bucket.to - bucket.from) * 100) / (maxVal - minVal);
}
</script>

<div class="q-table-colorColumn-legend--numerical">
  <div class="s-legend-icon-label">
    <div class="q-table-colorColumn-legend-value-container">
      <span class="q-table-colorColumn-legend-value-container--minVal s-font-note s-font-note--tabularnums">
        {minValue}
      </span>
      <span class="q-table-colorColumn-legend-value-container--maxVal s-font-note s-font-note--tabularnums">
        {maxValue}
      </span>
    </div>

    <div class="q-table-colorColumn-legend-border-container">
      <svg class="q-table-colorColumn-legend">
        <g>
          {#each buckets as bucket}
            {#if bucket.color.customColor}
              <rect
                class="q-table-colorColumn-legend-bucket"
                style="color: {bucket.color.customColor}"
                width="{getBucketWidth(bucket, minValue, maxValue)}%"
                height="16"
                x="{getAspectXValue(bucket, minValue, maxValue)}%"
                y="12" />
            {:else}
              <rect
                class="q-table-colorColumn-legend-bucket {bucket.color.colorClass}"
                width="{getBucketWidth(bucket, minValue, maxValue)}%"
                height="16"
                x="{getAspectXValue(bucket, minValue, maxValue)}%"
                y="12" />
            {/if}
          {/each}
        </g>

        {#if labelLegend !== null}
          <g>
            <circle cx="{labelLegend.position}%" cy="20" r="4" stroke="white" stroke-width="1" fill="none" />
            <rect class="s-color-gray-9" fill="currentColor" width="0.5px" height="16" x="{labelLegend.position}%" y="20" />
          </g>
        {/if}
      </svg>
      <div class="q-table-colorColumn-legend-borders s-color-gray-6" />
    </div>

    {#if labelLegend !== null}
      <div class="q-table-colorColumn-legend-marker s-font-note s-font-note--tabularnums" style={labelLegend.descriptionAlignment}>
        {labelLegend.label}: {labelLegend.value}
      </div>
    {/if}
  </div>

  {#if hasSingleValueBucket || hasNullValues}
    <div class="s-legend-icon-label">
      {#if hasSingleValueBucket}
        <div class="s-legend-item-label__item q-table-colorColumn-legend-info--single-bucket">
          <svg
            width="11"
            height="11"
            class="s-legend-item-label__item__icon q-table-colorColumn-legend-info-icon"
            class:q-table-colorColumn-legend-info-icon--interactive={!noInteraction}
            class:q-table-colorColumn-legend-info-icon--no-interactive={noInteraction}>
            {#if buckets[0].color.customColor}
              <rect width="11" height="11" class="q-table-colorColumn-legend-bucket" style="color: {buckets[0].color.customColor}" />
            {:else}
              <rect width="11" height="11" class="q-table-colorColumn-legend-bucket {buckets[0].color.colorClass}" />
            {/if}
          </svg>
          <div class="s-legend-item-label__item__label s-font-note--tabularnums">
            = {buckets[0].from}
          </div>
        </div>
      {/if}

      {#if hasNullValues}
        <div class="s-legend-item-label__item q-table-colorColumn-legend-info--no-data">
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
      {/if}
    </div>
  {/if}
</div>

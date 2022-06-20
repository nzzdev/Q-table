<script>
  export let colorColumn;
  export let noInteraction;

  function getAspectXValue(bucket, minVal, maxVal) {
    return ((bucket.from - minVal) * 100) / (maxVal - minVal);
  }

  function getBucketWidth(bucket, minVal, maxVal) {
    return ((bucket.to - bucket.from) * 100) / (maxVal - minVal);
  }
</script>

{#if colorColumn.colorColumnType === "numerical"}
  <!-- display numerical legend -->
  <div
    class="q-table-colorColumn-legend-container q-table-colorColumn-legend-container--desktopp"
  >
    <div class="q-table-colorColumn-legend--numerical">
      <div class="s-legend-icon-label">
        <div class="q-table-colorColumn-legend-value-container">
          <span
            class="q-table-colorColumn-legend-value-container--minVal s-font-note s-font-note--tabularnums"
            >{colorColumn.legendData.minValue}</span
          >
          <span
            class="q-table-colorColumn-legend-value-container--maxVal s-font-note s-font-note--tabularnums"
            >{colorColumn.legendData.maxValue}</span
          >
        </div>
        <div class="q-table-colorColumn-legend-border-container">
          <svg class="q-table-colorColumn-legend">
            <g>
              {#each colorColumn.legendData.buckets as bucket, bucketIndex}
                {#if bucket.color.customColor}
                  <rect
                    class="q-table-colorColumn-legend-bucket"
                    style="color: {bucket.color.customColor}"
                    width="{getBucketWidth(
                      bucket,
                      colorColumn.legendData.minValue,
                      colorColumn.legendData.maxValue
                    )}%"
                    height="16"
                    x="{getAspectXValue(
                      bucket,
                      colorColumn.legendData.minValue,
                      colorColumn.legendData.maxValue
                    )}%"
                    y="12"
                  />
                {:else}
                  <rect
                    class="q-table-colorColumn-legend-bucket {bucket.color
                      .colorClass}"
                    width="{getBucketWidth(
                      bucket,
                      colorColumn.legendData.minValue,
                      colorColumn.legendData.maxValue
                    )}%"
                    height="16"
                    x="{getAspectXValue(
                      bucket,
                      colorColumn.legendData.minValue,
                      colorColumn.legendData.maxValue
                    )}%"
                    y="12"
                  />
                {/if}
              {/each}
            </g>
            {#if colorColumn.legendData.labelLegend !== null}
              <g>
                <circle
                  cx="{colorColumn.legendData.labelLegend.position}%"
                  cy="20"
                  r="4"
                  stroke="white"
                  stroke-width="1"
                  fill="none"
                />
                <rect
                  class="s-color-gray-9"
                  fill="currentColor"
                  width="0.5px"
                  height="16"
                  x="{colorColumn.legendData.labelLegend.position}%"
                  y="20"
                />
              </g>
            {/if}
          </svg>
          <div class="q-table-colorColumn-legend-borders s-color-gray-6" />
        </div>
        {#if colorColumn.legendData.labelLegend !== null}
          <div
            class="q-table-colorColumn-legend-marker s-font-note s-font-note--tabularnums"
            style={colorColumn.legendData.labelLegend.descriptionAlignment}
          >
            {colorColumn.legendData.labelLegend.label}: {colorColumn.legendData
              .labelLegend.value}
          </div>
        {/if}
      </div>
      {#if colorColumn.legendData.hasSingleValueBucket || colorColumn.legendData.hasNullValues}
        <div class="s-legend-icon-label">
          {#if colorColumn.legendData.hasSingleValueBucket}
            <div
              class="s-legend-item-label__item q-table-colorColumn-legend-info--single-bucket"
            >
              <svg
                width="11"
                height="11"
                class="s-legend-item-label__item__icon q-table-colorColumn-legend-info-icon"
                class:q-table-colorColumn-legend-info-icon--interactive={!noInteraction}
                class:q-table-colorColumn-legend-info-icon--no-interactive={noInteraction}
              >
                {#if colorColumn.legendData.buckets[0].color.customColor}
                  <rect
                    width="11"
                    height="11"
                    class="q-table-colorColumn-legend-bucket"
                    style="color: {colorColumn.legendData.buckets[0].color
                      .customColor}"
                  />
                {:else}
                  <rect
                    width="11"
                    height="11"
                    class="q-table-colorColumn-legend-bucket {colorColumn
                      .legendData.buckets[0].color.colorClass}"
                  />
                {/if}
              </svg>
              <div
                class="s-legend-item-label__item__label s-font-note--tabularnums"
              >
                = {colorColumn.legendData.buckets[0].from}
              </div>
            </div>
          {/if}
          {#if colorColumn.legendData.hasNullValues}
            <div
              class="s-legend-item-label__item q-table-colorColumn-legend-info--no-data"
            >
              <svg
                width="11"
                height="11"
                class="s-legend-item-label__item__icon q-table-colorColumn-legend-info-icon"
                class:q-table-colorColumn-legend-info-icon--interactive={!noInteraction}
                class:q-table-colorColumn-legend-info-icon--no-interactive={noInteraction}
              >
                <rect
                  width="11"
                  height="11"
                  class="s-color-gray-4"
                  fill="white"
                  stroke="currentColor"
                  stroke-width="2"
                />
              </svg>
              <div class="s-legend-item-label__item__label">Keine Daten</div>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
{:else}
  <!-- display categorical legend -->
  <div class="q-table-colorColumn-legend--categorical">
    <div class="s-legend-icon-label">
      {#each colorColumn.legendData.categories as category, categoryIndex}
        {#if category.color.customColor}
          <div
            class="s-legend-item-label__item"
            style="color: {category.color.customColor}"
          >
            <div
              class="s-legend-item-label__item__icon s-legend-item-label__item__icon--default"
            />
            <div class="s-legend-item-label__item__label">{category.label}</div>
          </div>
        {:else}
          <div class="s-legend-item-label__item {category.color.colorClass}">
            <div
              class="s-legend-item-label__item__icon s-legend-item-label__item__icon--default"
            />
            <div class="s-legend-item-label__item__label">{category.label}</div>
          </div>
        {/if}
      {/each}
    </div>
    {#if colorColumn.legendData.hasNullValues}
      <div class="s-legend-icon-label">
        <div class="s-legend-item-label__item">
          <svg
            width="11"
            height="11"
            class="s-legend-item-label__item__icon q-table-colorColumn-legend-info-icon"
            class:q-table-colorColumn-legend-info-icon--interactive={!noInteraction}
            class:q-table-colorColumn-legend-info-icon--no-interactive={noInteraction}
          >
            <rect
              width="11"
              height="11"
              class="s-color-gray-4"
              fill="white"
              stroke="currentColor"
              stroke-width="2"
            />
          </svg>
          <div class="s-legend-item-label__item__label">Keine Daten</div>
        </div>
      </div>
    {/if}
  </div>
{/if}

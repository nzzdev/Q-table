<script lang="ts">
import type { NumericalLegend } from 'src/helpers/colorColumnLegend';

export let legend: NumericalLegend;

const methodBox = legend.methodBox;
const formattedBuckets = methodBox.formattedBuckets;
</script>

<div class="qtable-methodiek-static">
  <div class="s-font-title-s">Daten und Methodik</div>
  <div>
    {#if formattedBuckets}
      <div class="s-legend-icon-label">
        {#each formattedBuckets as bucket, bucketIndex}
          <div class="s-legend-item-label__item">
              <div
                class="s-legend-item-label__item__icon s-legend-item-label__item__icon--default {bucket.color.colorClass}"
                style="color: {bucket.color.customColor}"></div>

            <div class="s-legend-item-label__item__label s-font-note--tabularnums">
              {#if bucketIndex === 0 && legend.hasSingleValueBucket}
                {bucket.from} (nur ein Datenpunkt)
              {:else}
                {bucket.from}–{bucket.to}
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}

    <div class="qtable-methodiek-descr s-font-note-s">
      {methodBox.text}
    </div>
  </div>
</div>

<style lang="scss">
:global(.qtable-methodiek-static) {
  margin-top: 12px;
  padding-right: 20px;

  :global(.s-legend-item-label__item__icon) {
    margin-right: 8px;
  }
}

:global(.qtable-methodiek-descr) {
  margin-top: 4px;
}
</style>

<script lang="ts">
import OpenIcon from './svg/OpenIcon.svelte';
import CloseIcon from './svg/CloseIcon.svelte';
import type { NumericalLegend } from 'src/helpers/colorColumnLegend';

export let noInteraction: boolean;
export let legend: NumericalLegend;

const methodBox = legend.methodBox;

const formattedBuckets = methodBox.formattedBuckets;
</script>

{#if noInteraction}
  <div class="q-table-methodbox--no-interaction">
    <div class="s-font-title-s">Daten und Methodik</div>
    <div>
      {#if formattedBuckets}
        <div class="s-legend-icon-label">
          {#each formattedBuckets as bucket, bucketIndex}
            <div class="s-legend-item-label__item q-table-methods-box-static">
              {#if bucket.color.customColor}
                <div
                  class="q-table-methods-circle-static s-legend-item-label__item__icon s-legend-item-label__item__icon--default"
                  style="color: {bucket.color.customColor}" />
              {:else}
                <div class="q-table-methods-circle-static s-legend-item-label__item__icon s-legend-item-label__item__icon--default {bucket.color.colorClass}" />
              {/if}
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

      <div class="q-table-methods-description s-font-note-s">
        {methodBox.text}
      </div>
    </div>
  </div>
{:else}
  <div class="q-table-methods-link s-font-note-s">
    <OpenIcon />
    <CloseIcon />
    <div class="q-table-methods-link-text">Daten und Methodik</div>
  </div>
  <div class="q-table-methods-container hidden s-font-note-s">
    <div class="q-table-methods-legend">
      <table class="q-table-methods-legend-table s-font-note--tabularnums">
        {#if formattedBuckets}
          {#each formattedBuckets as bucket, bucketIndex}
            <tr>
              <td>
                <div
                  class="{bucket.color.colorClass !== undefined ? bucket.color.colorClass : ''}
                  q-table-methods-circle
                  q-table-methods-circle--circle-fill"
                  style="color: {bucket.color.customColor !== undefined ? bucket.color.customColor : ''}" />
              </td>
              {#if bucketIndex === 0 && legend.hasSingleValueBucket}
                <td />
                <td />
                <td>
                  {bucket.from}
                </td>
                <td>(nur ein Datenpunkt)</td>
              {:else}
                <td>
                  {bucket.from}
                </td>
                <td>–</td>
                <td>
                  {bucket.to}
                </td>
                <td />
              {/if}
            </tr>
          {/each}
        {/if}
      </table>
    </div>
    <div class="q-table-methods-description">{methodBox.text}</div>
    <div class="q-table-methods-article-container">
      <a href={methodBox.article.url} target="_blank" rel="noopener noreferrer">
        {methodBox.article.title}
      </a>
    </div>
  </div>
{/if}

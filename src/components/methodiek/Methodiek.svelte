<script lang="ts">
import OpenIcon from '@cps/svg/OpenIcon.svelte';
import CloseIcon from '@cps/svg/CloseIcon.svelte';
import type { NumericalLegend } from 'src/helpers/colorColumnLegend';

export let legend: NumericalLegend;

const methodBox = legend.methodBox;

const formattedBuckets = methodBox.formattedBuckets;
let showMethodiek = false;

function setMethodiek(bool: boolean): void {
  showMethodiek = bool;
}
</script>

{#if !showMethodiek}
  <div class="qtable-methodiek-btn s-font-note-s" on:click={() => setMethodiek(true)}>
    <OpenIcon />
    Daten und Methodik
  </div>
{/if}

{#if showMethodiek}
  <div class="qtable-methodiek-btn s-font-note-s" on:click={() => setMethodiek(false)}>
    <CloseIcon />
    Daten und Methodik
  </div>
{/if}

{#if showMethodiek}
  <div class="qtable-methodiek-cntr s-font-note-s">
    <table class="qtable-methodiek-legend s-font-note--tabularnums">
      {#if formattedBuckets}
        {#each formattedBuckets as bucket, bucketIndex}
          <tr>
            <td>
              <div
                class="{bucket.color.colorClass}
                qtable-methodiek-legend-circle"
                style="color:{bucket.color.customColor}"></div>
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

    <div class="qtable-methodiek-descr">{methodBox.text}</div>
    <a class="qtable-methodiek-clr-explainer" href={methodBox.article.url}  target="_blank" rel="noopener noreferrer">
      {methodBox.article.title}
    </a>
  </div>
{/if}

<style lang="scss">
:global(.qtable-methodiek-btn) {
  align-items: center;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  gap: 4px;
  margin-top: 8px;
  text-decoration: underline;

  :global(svg) {
    height: 10px;
    width: 10px;
  }
}

:global(.qtable-methodiek-cntr) {
  margin-top: 8px;
  box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f2;
  padding: 8px;

  // Have to override default nzz table stylings.
  :global(table) {
    table-layout: auto;

    :global(tr) {
      text-align: right;

      :global(td) {
        width: auto;
      }
      }
  }
}

:global(.qtable-methodiek-legend-circle) {
  position: relative;
    box-sizing: content-box;
    width: 7px;
    height: 7px;
    margin: 2px 8px 2px 2px;
    border: 1px solid;
    border-radius: 50%;
    background-color: currentColor;
}

:global(.qtable-methodiek-descr) {
  margin-top: 4px;
}

:global(.qtable-methodiek-clr-explainer) {
  color: #05032d;
  display: block;
  margin-top: 4px;
}
</style>

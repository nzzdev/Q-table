<script lang="ts">
import Footnote from './Footnote.svelte';

export let cls = '';
export let label = '';
export let footnote = '';
</script>

<span class="qtable-cell-label {cls}">
  {label}

  {#if footnote !== ''}
    <Footnote text={footnote} />
  {/if}
</span>

<style lang="scss">
:global(.qtable-cell-label) {
  // Need it for positioning footnotes correctly.
  display: inline-block;
  position: relative;
}
</style>

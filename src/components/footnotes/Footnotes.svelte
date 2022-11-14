<script lang="ts">
import type { Footnote } from '@helpers/footnotes';
export let footnotes: Footnote[];
</script>

{#each footnotes as footnote}
  <div class="q-table-footnote-footer s-font-note-s">
    <span class="q-table-footnote-index s-font-note--tabularnums">
      {footnote.index}
    </span>
    <span class="q-table-footnote-text">
      {footnote.value}
    </span>
  </div>
{/each}

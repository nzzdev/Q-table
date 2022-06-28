<script lang="ts">
import type { StructuredFootnote } from '../helpers/footnotes';
export let footnotes: StructuredFootnote[];
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

<script lang="ts">
import { getContext } from 'svelte';
import type { QTableStateContext } from '../../interfaces';

export let totalNumberOfRows: number;
export let pageSize: number;

let showingAllRows = false;
const stateContext = getContext<QTableStateContext>('state');

function toggle(): void {
  showingAllRows = !showingAllRows;

  if (showingAllRows) {
    stateContext.setPageSize(totalNumberOfRows);
  } else {
    stateContext.setPageSize(pageSize);
  }
}
</script>

<button class="s-button s-button--secondary q-table_show-more-button" on:click={toggle}>
  {#if showingAllRows === true}
    Tabelle zuklappen
  {:else}
    Alle {totalNumberOfRows} anzeigen
  {/if}
</button>

<script lang="ts">
import { getContext } from 'svelte';
import type { QTableStateContext } from '@src/interfaces';

const stateContext = getContext<QTableStateContext>('state');

export let count: number;
export let pageSize: number;
export let page: number;

export let labels = {
  first: '<<',
  last: '>>',
  next: '>',
  previous: '<',
};

$: pageCount = Math.ceil(count / pageSize);

function onClick(nextPage: number): void {
  stateContext.setPage(nextPage);

  page = nextPage;
}
</script>

<ul>
  <li>
    <button disabled={page === 0} on:click={() => onClick(0)}>
      {labels.first}
    </button>
  </li>

  <li>
    <button disabled={page === 0} on:click={() => onClick(page - 1)}>
      {labels.previous}
    </button>
  </li>

  <li class="counters s-font-note">
    {#if count === 0}
      0 / 0
    {:else}
      {page + 1} / {pageCount}
    {/if}
  </li>

  <li>
    <button disabled={page >= pageCount - 1} on:click={() => onClick(page + 1)}>
      {labels.next}
    </button>
  </li>

  <li>
    <button disabled={page >= pageCount - 1} on:click={() => onClick(pageCount - 1)}>
      {labels.last}
    </button>
  </li>
</ul>

<style>
ul {
  margin: 0;
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: end;
}
.counters {
  margin: 0 5px;
}

button {
  background: transparent;
  border: 1px solid #ccc;
  padding: 5px 10px;
  margin-left: 3px;
  float: left;
  cursor: pointer;
}

button[disabled] {
  opacity: 0.5;
}
</style>

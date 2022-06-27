<script lang="ts">
import { getContext } from "svelte";
import type { QTableDataFormatted, QTableStateContext } from "../interfaces";

const stateContext = getContext<QTableStateContext>("state");

export let index = -1;
export let text = '';

export let filter = (row: QTableDataFormatted[], search: string, index: number) => {
  search = search.toLowerCase();

  for (let i in row) {
    let columnValue = row[i].value || '';
    columnValue = columnValue.toString().toLowerCase();

    if (columnValue.indexOf(search) > -1) {

      console.log(columnValue, search);
      return true;
    }
  }

  return false;
};

async function onSearch() {
  const state = stateContext.getState();

  const detail = {
    filter,
    index,
    text,
    page: state.page,
    pageIndex: state.pageIndex,
    pageSize: state.pageSize,
    rows: state.filteredRows
  };

  if (detail.text.length <= 0) {
    stateContext.setFilteredRows(state.rows);
  } else {
    const filteredRows = state.rows.filter(r => detail.filter(r, detail.text, index));
    stateContext.setFilteredRows(filteredRows);
  }

  stateContext.setPage(0);
}

</script>

<div class="q-table__search">
  <input
    class="q-table__search__input s-input-field"
    type="search"
    placeholder="Bitte Suche eingeben"
    maxlength="20"
    autocapitalize="off"
    autocomplete="off"
    spellcheck="false"
    aria-label="Suchen"
    on:keyup={onSearch}
    bind:value={text}
  />
</div>

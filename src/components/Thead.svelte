<script lang="ts">
import type { Minibar } from "../helpers/minibars";
import type { QTableDataFormatted } from "../interfaces";

export let tableHead: QTableDataFormatted[];
export let minibar: Minibar | null;
export let initWithCardLayout: boolean;

function getAttributes(colIndex: number) {
  let colspan = 0;
  let classes = '';

  if (
    minibar &&
    minibar.type &&
    minibar.settings.selectedColumn === colIndex &&
    minibar.type !== "mixed" &&
    !initWithCardLayout
  ) {
    colspan = 2;
    classes = "q-table-minibar-header";
  } else if (
    minibar &&
    minibar.type === "mixed" &&
    minibar.settings.selectedColumn === colIndex
  ) {
    colspan = 0;
    classes = "q-table-minibar-header";
  }

  return { colspan, classes };
}
</script>

<thead class="s-font-note s-font-note--strong">
  {#each tableHead as head, colIndex}
    <th
      class="q-table__cell q-table-cell--head q-table__cell--{head.type} {head.classes.join(
        ' '
      )} {getAttributes(colIndex).classes}"
      colspan={getAttributes(colIndex).colspan}
    >
      {#if head.footnote}
        <span
          data-annotation={head.footnote.value}
          class="q-table-footnote-annotation">{head.value}</span
        >
      {:else if head.value}
        {head.value}
      {/if}
    </th>
  {/each}
</thead>

<script>
export let data;
export let headers;

function getAttributes(colIndex) {
    let colspan = 0;
    let classes = "";
    if (
    minibar &&
    minibar.type &&
    item.options.minibar &&
    item.options.minibar.selectedColumn === colIndex &&
    minibar.type !== "mixed" &&
    !initWithCardLayout
    ) {
    colspan = 2;
    classes = "q-table-minibar-header";
    } else if (
    minibar &&
    minibar.type === "mixed" &&
    item.options.minibar &&
    item.options.minibar.selectedColumn === colIndex
    ) {
    colspan = 0;
    classes = "q-table-minibar-header";
    }
    return { colspan, classes };
}
</script>

<thead class="s-font-note s-font-note--strong">
    {#each headers as head, colIndex}
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


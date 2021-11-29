<script>
  export let item;
  export let tableData;
  export let cell;
  export let minibar;
  export let colIndex;
  export let rowIndex;
  export let initWithCardLayout;

  // this has to be done because the tableData will be sliced before iterating
  rowIndex += 1;

  function getDataLabelAttribute() {
    let dataLabel = "";
    if (item.options.hideTableHeader !== true) {
      dataLabel = tableData[0][colIndex].value;
      if (
        (item.options.cardLayout || item.options.cardLayoutIfSmall) &&
        tableData[0][colIndex].footnote &&
        rowIndex === 0
      ) {
        dataLabel += tableData[0][colIndex].footnote.unicode;
      }
    }
    return dataLabel;
  }

  function getMinibarColor() {
    return minibar.values[rowIndex].type === "positive"
      ? minibar.barColor.positive.colorCode
      : minibar.barColor.negative.colorCode;
  }

  function getMinibarClasses() {
    let classes = "";
    if (
      item.options.minibar.selectedColumn === colIndex &&
      !initWithCardLayout
    ) {
      classes = "q-table-minibar--mixed";
    } else {
      classes = `q-table__cell--${cell.type}`;
    }
    return classes;
  }

  function getFootnoteClasses() {
    if (cell.footnote) {
      return minibar.values[rowIndex].type === "positive"
        ? cell.footnote.class
        : "";
    }
    return "";
  }

  function getMinibarClassName() {
    return minibar.values[rowIndex].type === "positive"
      ? minibar.barColor.positive.className
      : minibar.barColor.negative.className;
  }
</script>

<td
  data-label={getDataLabelAttribute()}
  data-minibar={minibar.type}
  class="q-table__cell {cell.classes.join(' ')} {getMinibarClasses()}">
  {#if item.options.minibar.selectedColumn === colIndex && !initWithCardLayout}
    <div
      data-minibar={minibar.values[rowIndex].type}
      class="q-table-minibar-alignment--{minibar.values[rowIndex].type} q-table__cell q-table__cell--{cell.type} {getFootnoteClasses()}">
      {#if cell.footnote}
        <span
          data-annotation={cell.footnote.value}
          class="q-table-footnote-annotation">
          {#if cell.value}
            {cell.value}
          {/if}
        </span>
      {:else}  
        {#if cell.value}
          {cell.value}
        {/if}
      {/if}
    </div>
  {:else if cell.footnote}
    <span
      data-annotation={cell.footnote.value}
      class="q-table-footnote-annotation">
      {#if cell.value}
        {cell.value}
      {/if}
    </span>
  {:else}
    {#if cell.value}
      {cell.value}
    {/if}
  {/if}
  {#if item.options.minibar.selectedColumn === colIndex && !initWithCardLayout}
    {#if minibar.values[rowIndex].type !== "empty"}
      <div
        data-minibar={minibar.values[rowIndex].type}
        class="q-table-minibar-bar--{minibar.values[rowIndex]
          .type} q-table-minibar--{minibar.values[rowIndex]
          .type} {getMinibarClassName()}"
        style="width: {minibar.values[rowIndex]
          .value}%; background-color: {getMinibarColor()}" />
    {/if}
  {/if}
</td>

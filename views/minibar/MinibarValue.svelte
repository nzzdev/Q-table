<script>
  export let item;
  export let tableData;
  export let minibar;
  export let cell;
  export let colIndex;
  export let rowIndex;

  function getDataLabelAttribute() {
    let dataLabel = "";
    if (item.options.hideTableHeader !== true) {
      dataLabel += tableData[0][colIndex].value;
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

  function getMinibarDataAttribute() {
    if (
      item.options.minibar.selectedColumn === colIndex &&
      !item.options.initWithCardLayout
    ) {
      return minibar.type;
    }
    return;
  }

  function getCellClass() {
    let classes = `q-table__cell q-table__cell--${
      cell.type
    } ${cell.classes.join(" ")} `;
    if (
      item.options.minibar.selectedColumn === colIndex &&
      !item.options.initWithCardLayout
    ) {
      classes += "q-table-minibar-cell--value";
    }
    return classes;
  }

  function getCellStyles() {
    let styles = "";
    if (
      item.options.minibar.selectedColumn === colIndex &&
      !item.options.initWithCardLayout
    ) {
      if (minibar.type === "positive") {
        styles += "padding-left: 12px";
      } else if (minibar.type === "negative") {
        styles = "padding-right: 12px;";
      }
    }
    return styles;
  }
</script>

<td
  data-label={getDataLabelAttribute()}
  data-minibar={getMinibarDataAttribute()}
  class={getCellClass()}
  style={getCellStyles()}
>
  {#if cell.footnote}
    <span
      data-annotation={cell.footnote.value}
      class="q-table-footnote-annotation">{cell.value}</span
    >
  {:else}
    {cell.value}
  {/if}
</td>

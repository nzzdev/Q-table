<script>
  export let item;
  export let minibar;
  export let rowIndex;
  export let colIndex;
  export let initWithCardLayout;

  // this has to be done because the tableData will be sliced before iterating
  rowIndex += 1;

  function getBarStyle() {
    let style = "";
    if (minibar.values[rowIndex].type !== "empty") {
      style = `width: ${minibar.values[rowIndex].value}%;`;
      if (
        minibar.barColor.positive.colorCode ||
        minibar.barColor.negative.colorCode
      ) {
        if (minibar.barColor.positive.colorCode) {
          style += `background-color: ${minibar.barColor.positive.colorCode};`;
        }
        if (minibar.barColor.negative.colorCode) {
          style += `background-color: ${minibar.barColor.negative.colorCode};`;
        }
      }
    }
    return style;
  }

  function getCellStyle() {
    let style = "";
    // check for type and return accordingly
    if (minibar.type === "positive") {
      style = "padding-right: 12px !important;";
    } else if (minibar.type === "negative") {
      style = "padding-left: 12px; padding-right: 0px !important;";
    }
    return style;
  }
</script>

{#if (item.options.minibar.selectedColumn !== null || item.options.minibar.selectedColumn !== undefined) && item.options.minibar.selectedColumn === colIndex && !initWithCardLayout}
  <td
    class="q-table-minibar-cell"
    data-minibar={minibar.type}
    style={getCellStyle()}
  >
    <div
      class="q-table-minibar-bar--{minibar.values[rowIndex].type} {minibar
        .barColor.negative.className}"
      style={getBarStyle()}
    />
  </td>
{/if}

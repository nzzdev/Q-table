<script>
  import Legend from "./Legend.svelte";
  import Footer from "./Footer.svelte";
  import MinibarBox from "./minibar/MinibarBox.svelte";
  import MinibarValue from "./minibar/MinibarValue.svelte";
  import MixedMinibars from "./minibar/MixedMinibars.svelte";
  import MethodBox from "./MethodBox.svelte";
  import Cell from "./Cell.svelte";
  export let item;
  export let initWithCardLayout;
  export let tableData;
  export let minibar;
  export let footnotes;
  export let colorColumn;
  export let numberOfRowsToHide;
  export let displayOptions;
  export let noInteraction;
  export let id;

  function getAttributes(colIndex) {
    let colspan = 0;
    let classes = "";
    if (
      minibar &&
      minibar.type &&
      item.options.minibar &&
      (item.options.minibar.selectedColumn !== null ||
        item.options.minibar.selectedColumn !== undefined) &&
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
      (item.options.minibar.selectedColumn !== null ||
        item.options.minibar.selectedColumn !== undefined) &&
      item.options.minibar.selectedColumn === colIndex
    ) {
      colspan = 0;
      classes = "q-table-minibar-header";
    }
    return { colspan, classes };
  }
</script>

<div
  class="s-q-item q-table"
  class:q-table--card-layout={initWithCardLayout}
  {id}
  style="opacity: 0;"
>
  {#if displayOptions.hideTitle !== true}
    <h3 class="s-q-item__title">{item.title}</h3>
  {/if}
  {#if item.subtitle && item.subtitle !== ""}
    <div class="s-q-item__subtitle">{item.subtitle}</div>
  {/if}
  <div style="overflow-x: auto;">
    {#if noInteraction !== true && item.options.showTableSearch === true && tableData.length > 16}
      <div class="q-table__search">
        <input
          class="q-table__search__input s-input-field"
          type="search"
          placeholder="Bitte Suche eingeben"
          maxlength="20"
          value=""
          autocapitalize="off"
          autocomplete="off"
          spellcheck="false"
          aria-label="Suchen"
        />
      </div>
    {/if}
    {#if colorColumn && colorColumn.selectedColumn !== undefined && !initWithCardLayout}
      <Legend {colorColumn} {noInteraction} />
    {/if}
    <table class="q-table__table">
      {#if item.options.hideTableHeader !== true}
        <thead class="s-font-note s-font-note--strong">
          {#each tableData[0] as head, colIndex}
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
      {/if}
      <tbody class="s-font-note">
        {#each tableData.slice(1) as row, rowIndex}
          <tr
            class:hidden={numberOfRowsToHide &&
              rowIndex.index >= tableData.length - numberOfRowsToHide}
          >
            {#each row as cell, colIndex}
              {#if item.options.minibar && (item.options.minibar.selectedColumn !== null || item.options.minibar.selectedColumn !== undefined) && item.options.minibar.selectedColumn === colIndex}
                {#if minibar.type === "positive"}
                  <MinibarValue
                    {item}
                    {tableData}
                    {minibar}
                    {cell}
                    {colIndex}
                    {rowIndex}
                  />
                  <MinibarBox
                    {item}
                    {tableData}
                    {minibar}
                    {cell}
                    {colIndex}
                    {rowIndex}
                  />
                {:else if minibar.type === "negative"}
                  <MinibarBox
                    {item}
                    {tableData}
                    {minibar}
                    {cell}
                    {colIndex}
                    {rowIndex}
                  />
                  <MinibarValue
                    {item}
                    {tableData}
                    {minibar}
                    {cell}
                    {colIndex}
                    {rowIndex}
                  />
                {:else if minibar.type === "mixed"}
                  <MixedMinibars
                    {item}
                    {tableData}
                    {minibar}
                    {cell}
                    {rowIndex}
                    {colIndex}
                    {initWithCardLayout}
                  />
                {:else}
                  <Cell
                    {item}
                    {cell}
                    {tableData}
                    {colorColumn}
                    {colIndex}
                    {rowIndex}
                    {initWithCardLayout}
                  />
                {/if}
              {:else}
                <Cell
                  {item}
                  {cell}
                  {tableData}
                  {colorColumn}
                  {colIndex}
                  {rowIndex}
                  {initWithCardLayout}
                />
              {/if}
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  {#if footnotes.length > 0}
    {#each footnotes as footnote}
      <div class="q-table-footnote-footer s-font-note-s">
        <span class="q-table-footnote-index s-font-note--tabularnums"
          >{footnote.index}</span
        ><span class="q-table-footnote-text">{footnote.value}</span>
      </div>
    {/each}
  {/if}
  {#if colorColumn && colorColumn.methodBox && colorColumn.methodBox !== null}
    <MethodBox {colorColumn} {noInteraction} />
  {/if}
  <Footer {item} />
</div>

<style>
  .hidden {
    display: none;
  }
</style>

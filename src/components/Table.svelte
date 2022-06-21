<script lang="ts">
import Legend from "./Legend.svelte";
import Footer from "./Footer.svelte";
import MinibarBox from "./minibar/MinibarBox.svelte";
import MinibarValue from "./minibar/MinibarValue.svelte";
import MixedMinibars from "./minibar/MixedMinibars.svelte";
import MethodBox from "./MethodBox.svelte";
import Cell from "./Cell.svelte";
import Footnotes from "./Footnotes.svelte";
import type { DisplayOptions, QTableConfig, QTableDataFormatted } from "../interfaces";
import type { ColorColumn } from "../helpers/colorColumn";
import type { Minibar } from "../helpers/minibars";
import type { StructuredFootnote } from "../helpers/footnotes";

export let config: QTableConfig;
export let item: QTableConfig;
export let initWithCardLayout: boolean;
export let tableData: QTableDataFormatted[][];
export let minibar: Minibar | null;
export let footnotes: StructuredFootnote[] | null;
export let colorColumn: ColorColumn | null;
export let numberOfRowsToHide: number | undefined;
export let displayOptions: DisplayOptions;
export let noInteraction: boolean;
export let id: string;

const options = config.options;

function getAttributes(colIndex: number) {
  let colspan = 0;
  let classes = "";

  if (
    minibar &&
    minibar.type &&
    options.minibar &&
    options.minibar.selectedColumn === colIndex &&
    minibar.type !== "mixed" &&
    !initWithCardLayout
  ) {
    colspan = 2;
    classes = "q-table-minibar-header";
  } else if (
    minibar &&
    minibar.type === "mixed" &&
    options.minibar &&
    options.minibar.selectedColumn === colIndex
  ) {
    colspan = 0;
    classes = "q-table-minibar-header";
  }

  return { colspan, classes };
}

function shouldShowLegend(): boolean {
  return options.hideLegend !== true &&
         colorColumn !== null &&
         colorColumn.selectedColumn !== undefined &&
         colorColumn.selectedColumn !== options.minibar.selectedColumn &&
         !initWithCardLayout
}
</script>

<div
  class="s-q-item q-table"
  class:q-table--card-layout={initWithCardLayout}
  {id}
  style="opacity: 0;"
>
  {#if displayOptions.hideTitle !== true}
    <h3 class="s-q-item__title">{config.title}</h3>
  {/if}

  {#if config.subtitle && config.subtitle !== ""}
    <div class="s-q-item__subtitle">{config.subtitle}</div>
  {/if}

  <div style="overflow-x: auto;">
    {#if noInteraction !== true && options.showTableSearch === true && tableData.length > 16}
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

    {#if shouldShowLegend() === true}
      <Legend {colorColumn} {noInteraction} />
    {/if}

    <table class="q-table__table">
      {#if options.hideTableHeader !== true}
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
              rowIndex >= tableData.length - numberOfRowsToHide}
          >
            {#each row as cell, colIndex}
              {#if options.minibar && options.minibar.selectedColumn !== null && options.minibar.selectedColumn !== undefined && options.minibar.selectedColumn === colIndex}
                {#if minibar && minibar.type === "positive"}
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
                {:else if minibar && minibar.type === "negative"}
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
                {:else if minibar && minibar.type === "mixed"}
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

  {#if footnotes && footnotes.length > 0}
    <Footnotes {footnotes}/>
  {/if}

  {#if colorColumn && colorColumn.methodBox !== null}
    <MethodBox {colorColumn} {noInteraction} />
  {/if}

  <Footer {item} />
</div>

<style>
.hidden {
  display: none;
}
</style>

<script lang="ts">
import Footnote from '../table/cell/Footnote.svelte';
import type { QTableSvelteProperties, Row } from '@src/interfaces';

export let componentConfiguration: QTableSvelteProperties;
export let rows: Row[];

const { tableHead } = componentConfiguration;
</script>

<div class="qtable-card-layout s-font-note">
  {#each rows as row (row.key)}
    <div class="qtable-card-row" class:qtable-row-frozen={row.frozen}>
      {#each row.cells as cell, colIndex}
        <div class={`qtable-card-cell ${cell.classes.join(' ')} `}>
          <span class="qtable-card-cell-title">
            {@html tableHead[colIndex].value}

            {#if tableHead[colIndex].footnote !== ''}
              <Footnote text={tableHead[colIndex].footnote} />
            {/if}
          </span>

          <span class="qtable-card-cell-value">
            {cell.value}
            {#if cell.footnote !== ''}
              <Footnote text={cell.footnote} />
            {/if}
          </span>
        </div>
      {/each}
    </div>
  {/each}
</div>

<style lang="scss">
:global(.qtable-card-layout) {
  margin-top: 16px;

  .qtable-card-row {
    border-bottom: 1px solid #e9e9ee;

    &:first-child {
      padding-top: 0;
    }
  }

  .qtable-row-frozen {
    background-color: #f4f4f4;
    border-bottom: 2px solid #000;
    border-top: 2px solid #000;
  }

  .qtable-card-cell {
    display: flex;
    justify-content: space-between;
    padding: 4px 0; // overwrite the padding from outside card-layout
    position: relative; // Needed for footnote.
  }

  .qtable-card-cell-title {
    font-weight: 500;
    max-width: 80%;
    position: relative; // Needed for footnote.
    text-align: left;
  }

  .qtable-card-cell-value {
    text-align: right;
  }
}
</style>

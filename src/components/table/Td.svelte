<script lang="ts">
import type { TableColumnType } from '@src/interfaces';

export let type: TableColumnType = 'text';
export let classes: string[] = [];
export let styles: string[] = [];

const tdClasses =  `qtable-cell qtable-cell-${type} ${classes.join(' ')} `;
</script>

<td class={tdClasses} style={styles.join(';')}>
  <slot />
</td>

<style lang="scss">
  :global(.qtable-cell) {
    text-align: left;
  }

  :global(.qtable-cell-numeric) {
    text-align: right !important;

    // extra spacing in case of footnotes. also generally looks nice
    padding: 10px 12px !important;

    // only td should not break, th of --numeric columns are allowed to wrap
    white-space: nowrap;
  }
</style>

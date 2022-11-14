<script lang="ts">
  import type { TableColumnType } from '@src/interfaces';

  export let type: TableColumnType = 'text';
  export let classes: string[] = [];
  export let styles: string[] = [];

  const tdClasses =  `q-table__cell q-table__cell--${type} ${classes.join(' ')} `;
</script>

<td class={tdClasses} style={styles.join(';')}>
  <slot />
</td>

<style lang="scss">
    :global(.q-table__cell) {
      text-align: left !important;

      > span {
        display: inline-block;
        position: relative;

        .q-table-footnote-annotation {
          color: #6e6e7e;
          font-size: 10px;
          margin-left: 1px;
          margin-top: -5.5px;
          position: absolute;
        }

        .q-table-footnote-annotation-colored-column {
          color: unset;
        }
      }
    }

    :global(.q-table__cell--numeric) {
      text-align: right !important;

      // extra spacing in case of footnotes. also generally looks nice
      padding: 10px 12px !important;

      // only td should not break, th of --numeric columns are allowed to wrap
      white-space: nowrap;
    }


</style>

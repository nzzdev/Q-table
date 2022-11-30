<script lang="ts">
import Td from '@cps/table/Td.svelte';
import CellLabel from './CellLabel.svelte';
import type { Cell } from '@src/interfaces';

export let cell: Cell;
</script>

<Td type={cell.type} classes={cell.classes}>
  <CellLabel label={cell.label} footnote={cell.footnote} />
</Td>

<style lang="scss">
</style>

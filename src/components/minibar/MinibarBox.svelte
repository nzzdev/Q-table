<script lang="ts">
import { MINIBAR_TYPE } from 'src/helpers/minibars';

export let type: MINIBAR_TYPE = MINIBAR_TYPE.POSITIVE;
export let clrCode = '';
export let clrClass = '';
export let width = 0;

</script>

<div
  class="qtable-minibar qtable-minibar-{type}
  {clrClass}"
  style:background={clrCode} style:width={`${width}%`}
></div>

<style lang="scss">
  :global(.qtable-minibar) {
    background-color: currentColor;
    display: inline-block;
    height: 17px;
    left: 0;
    position: absolute;
    top: 50%;
    transform: translate(0, -50%);
  }

  :global(.qtable-minibar::before) {
    content: '';
    border-left: 0.5px solid #393855;
    height: 19px;
    left: 0;
    position: absolute;
    top: -1px;
    width: 1px;
  }

  :global(.qtable-minibar-negative) {
    left: unset;
    right: 0;
  }

  :global(.qtable-minibar-negative::before) {
    left: unset;
    right: 0;
  }
</style>

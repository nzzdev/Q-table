<script lang="ts">
import { MINIBAR_TYPE, type Minibar } from 'src/helpers/minibars';

export let type: MINIBAR_TYPE = MINIBAR_TYPE.POSITIVE;
export let minibar: Minibar;
export let rowIndex: number;

function getBarStyle(): string {
  let style = '';

  if (type !== 'empty') {
    style = `width: ${minibar.values[rowIndex]}%;`;

    if (minibar.barColor.positive.colorCode) {
      style += `background-color: ${minibar.barColor.positive.colorCode};`;
    } else if (minibar.barColor.negative.colorCode) {
      style += `background-color: ${minibar.barColor.negative.colorCode};`;
    }
  }

  return style;
}

function getMinibarClassName(): string {
  return type === 'positive' ? minibar.barColor.positive.className : minibar.barColor.negative.className;
}
</script>

<div class="q-table-minibar-bar--{type} {getMinibarClassName()}" style={getBarStyle()}></div>

<style lang="scss">
:global(.q-table-minibar-bar--positive) {
  background-color: currentColor;
  position: relative;
  height: 17px;
  display: inline-block;
}

:global(.q-table-minibar-bar--positive::before) {
  content: '';
  border-left: 0.5px solid #393855;
  position: absolute;
  height: 19px;
  width: 1px;
  top: -1px;
}

:global(.q-table-minibar-bar--negative) {
  background-color: currentColor;
  position: relative;
  height: 17px;
}

:global(.q-table-minibar-bar--negative::before) {
  content: '';
  border-right: 0.5px solid #393855;
  position: absolute;
  width: 1px;
  height: 19px;
  top: -1px;
  right: 0px;
}

:global(.q-table-minibar-alignment--positive) {
  text-align: right;
  float: left;
  width: 50%;
  padding-right: 4px;
}

:global(.q-table-minibar-alignment--negative) {
  position: relative;
  text-align: left !important;
  float: left;
  left: 50%;
  padding-left: 4px;
}

:global(.q-table-minibar-alignment--empty) {
  text-align: center !important;
  width: 100%;
}
</style>

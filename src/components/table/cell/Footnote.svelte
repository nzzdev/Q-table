<script lang="ts">
export let text = '';
export let cls = '';
</script>

<span class="qtable-footnote {cls}">
  {text}
</span>

<style lang="scss">
:global(.qtable-footnote) {
  font-size: 10px;
  left: -3px;
  position: relative;
  top: -7px;
}
</style>

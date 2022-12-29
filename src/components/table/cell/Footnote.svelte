<script lang="ts">
export let text = '';
export let cls = '';

// TODO: need to check on staging if print is working correctly
// without the unicodes.
// if not will need function to transform each number to it's
// unicode value.
// const unicodes: Record<number, string> = {
//   0: '\u2070',
//   1: '\u00b9',
//   2: '\u00b2',
//   3: '\u00b3',
//   4: '\u2074',
//   5: '\u2075',
//   6: '\u2076',
//   7: '\u2077',
//   8: '\u2078',
//   9: '\u2079',
// };
</script>

<span class="qtable-footnote {cls}">
  {text}
</span>

<style lang="scss">
:global(.qtable-footnote) {
  font-size: 10px;
  left: 0;
  position: relative;
  top: -10px;
}
</style>

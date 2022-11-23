<script lang="ts">
  export let sortAscending = true;
  export let sortActive = false;
</script>

<span class:q-table__thead_sortArrow_not-active={!sortActive}>
  <svg class:q-table__thead_sortArrow_ascending={sortAscending} width="11px" height="14px" viewBox="0 0 11 14" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <title>Path</title>
      <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
          <g id="Grenze-und-Epizentrum" transform="translate(-1130.000000, -657.000000)" fill="#000000">
              <polygon id="Path" points="1135.824 657.121 1135.823 667.256 1139.063 664.028 1140.121 665.091 1135.074 670.121 1130 665.064 1131.059 664 1134.323 667.256 1134.324 657.121"></polygon>
          </g>
      </g>
  </svg>
</span>

<style>
  .q-table__thead_sortArrow_not-active {
    opacity: 0.25;
  }
  .q-table__thead_sortArrow_ascending {
    transform: rotate(180deg);
  }
</style>
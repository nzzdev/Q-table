<script>
  export let item;
</script>

<div class="s-q-item__footer">
  {#if item.notes}
    <div class="s-q-item__footer__notes">{item.notes}</div>
  {/if}
  <div class="s-q-item__footer__details">
    {#if item.sources && item.sources.length > 0}
      <div class="s-q-item__footer__sources">
        {#if item.sources.length > 1}Quellen:{:else}Quelle:{/if}
        {#each item.sources as source, index}
          {#if source.text !== ""}
            {#if source.link && source.link.url && source.link.isValid}<a href={source.link.url} target="blank" rel="noopener noreferrer">{source.text}</a>{:else}{source.text}{/if}{#if index !== item.sources.length - 1 && item.sources[index + 1] !== ""},&nbsp;{/if}{/if}
        {/each}
      </div>
    {/if}
  </div>
</div>
<script lang="ts">
import type { Source } from '@src/interfaces';

export let notes = '';
export let sources: Source[] = [];
export let acronym = '';
</script>

<div class="s-q-item__footer">
  {#if notes.length > 0}
    <div class="s-q-item__footer__notes">{@html notes}</div>
  {/if}

  <div class="s-q-item__footer__details">
    {#if sources.length > 0}
      <div class="s-q-item__footer__sources">
        <span class="q-table-footer-sources-prefix">
          {#if sources.length > 1}
            Quellen:
          {:else}
            Quelle:
          {/if}
        </span>

        {#each sources as source, index}
          {#if source.text !== ''}
            <span class="q-table-source">
              {#if source.link.url && source.link.isValid === true}
                <a href={source.link.url} target="_blank" rel="noopener noreferrer">{source.text}</a>
              {:else}
                {source.text}
              {/if}

              {#if index !== sources.length - 1 && sources[index + 1].text !== ''},&nbsp;{/if}
            </span>
          {/if}
        {/each}
      </div>
    {/if}
    {#if acronym}
      <div class="s-q-item__footer__acronym">NZZ / {acronym}</div>
    {:else}
      <div class="s-q-item__footer__acronym">NZZ</div>
    {/if}
  </div>
</div>

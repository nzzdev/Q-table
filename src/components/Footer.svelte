<script lang="ts">
import type { QTableConfig } from '../interfaces';

export let config: QTableConfig;

const { notes, sources } = config;
</script>

<div class="s-q-item__footer">
  {#if notes}
    <div class="s-q-item__footer__notes">{notes}</div>
  {/if}

  <div class="s-q-item__footer__details">
    {#if sources && sources.length > 0}
      <div class="s-q-item__footer__sources">
        {#if sources.length > 1}
          Quellen:
        {:else}
          Quelle:
        {/if}

        {#each sources as source, index}
          {#if source.text !== ''}
            {#if source.link && source.link.url && source.link.isValid}
              <a href={source.link.url} target="blank" rel="noopener noreferrer">{source.text}</a>
            {:else}
              {source.text}
            {/if}

            {#if index !== sources.length - 1 && sources[index + 1].text !== ''},&nbsp;{/if}
          {/if}
        {/each}
      </div>
    {/if}
  </div>
</div>

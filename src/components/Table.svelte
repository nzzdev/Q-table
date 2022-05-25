<script lang="ts">
import Legend from './Legend.svelte';
import Thead from './Thead.svelte';

export let id: string;
export let displayOptions;
export let config;
export let tableData;

console.log("tableData", tableData);

const subtitle = config.subtitle?.trim();


function shouldShowLegend() {
    return true;
    // return  colorColumn && colorColumn.selectedColumn !== undefined && colorColumn.selectedColumn !== item.options.minibar.selectedColumn && !initWithCardLayout;
}
</script>

<div class="s-q-item q-table" {id}>
    {#if displayOptions.hideTitle !== true}
        <h3 class="s-q-item__title">{config.title}</h3>
    {/if}

    {#if subtitle && subtitle !== ""}
        <div class="s-q-item__subtitle">{subtitle}</div>
    {/if}

    {#if shouldShowLegend() === true}
        <!-- <Legend {colorColumn} {noInteraction} /> -->
    {/if}

    <table class="q-table__table">
        {#if config.options.hideTableHeader !== true}
            <!-- <Thead headers={tableData[0]} /> -->
        {/if}

        <tbody class="s-font-note">

        </tbody>
    </table>
</div>

<style>

</style>

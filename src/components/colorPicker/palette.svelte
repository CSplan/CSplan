<script lang="ts">
import { createEventDispatcher } from 'svelte'

import colors from './colors/colors'

export let innerGap = 5
  
const pastels = Object.values(colors.pastel)
const brights = Object.values(colors.bright)
const colorGroups = [
  pastels,
  brights
]

// Dispatch color selection (done by clicking on buttons)
const dispatch = createEventDispatcher()
</script>

<div class="palette" style="--gap: {innerGap}px">
  {#each colorGroups as cGroup}
    <div class="color-group">
      {#each cGroup as color}
        <button style="background-color: {color}" on:click={() => dispatch('colorchange', color)}/>
      {/each}
    </div>
  {/each}
</div>

<style>
  .palette {
    height: 100%;
    width: 100%;
    display: grid;
    row-gap: var(--gap);
    grid-auto-flow: row;
  }
  .color-group {
    display: grid;
    column-gap: var(--gap);
    grid-auto-flow: column;
  }
  .palette button {
    padding: 0;
  }
  /* Get rid of washed out appearance left after clicking a color */
  .palette button:focus:not(:hover) {
    box-shadow: none;
  }
  .palette button {
    margin: 0;
  }
</style>

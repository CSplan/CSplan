<script>
import { createEventDispatcher } from 'svelte'

  import colors from './colors/colors'
  
  const pastels = Object.values(colors.pastel)

  // Dispatch color selection (done by clicking on buttons)
  const dispatch = createEventDispatcher()
  function onClick(color) {
    dispatch('colorchange', color)
  }
</script>

<div class="palette">
  {#each pastels as pastel}
    <button style="background-color: {pastel}" on:click={() => onClick(pastel)}></button>
  {/each}
</div>

<style>
  .palette {
    height: 100%;
    width: 100%;
    display: grid;
    column-gap: 0.375rem;
    grid-auto-flow: column;
  }
  .palette button {
    padding: 0;
  }
  /* Get rid of washed out appearance left after clicking a color */
  .palette button:focus:not(:hover) {
    box-shadow: none;
  }
</style>

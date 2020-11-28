<script>
  import colors from './colors/colors'
  
  const pastels = Object.values(colors.pastel)
</script>

<div class="palette">
  {#each pastels as pastel}
    <button style="background-color: {pastel}"></button>
  {/each}
</div>

<style>
  .palette {
    height: 100%;
    width: 100%;
    display: grid;
    column-gap: 0.25rem;
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

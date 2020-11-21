<script>
  import HueSlider from './hue.svelte'
  import Plane from './plane.svelte'
  export let id = 'color-picker'
  let hue = 0
</script>

<div class="card grid">
  <Plane id="{id}-color-plane" {hue}/>
  <HueSlider id="{id}-hue-slider" on:colorchange={(e) => hue = e.detail}/>
</div>

<style>
  .grid {
    margin-top: 10rem;
    padding: 0.5rem;
    --color-slider-width: 24px;
    display: grid;
    grid-template-columns: 1fr var(--color-slider-width);
    grid-template-rows: 1fr 40px;
    row-gap: 0.5rem;
    column-gap: 0.75rem;
    min-width: 400px;
    min-height: 400px;
  }
</style>

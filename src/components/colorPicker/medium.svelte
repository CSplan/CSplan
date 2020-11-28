<script>
  import HueSlider from './hue.svelte'
  import LightnessSlider from './lightness.svelte'
  import SaturationSlider from './saturation.svelte'
  import Plane from './plane.svelte'

  let hue = 0
  let saturation = 0
  let lightness = 0
  let hex = ''
  // Slider width MUST be declared in px, because radii for all cursors is calculated as r/2
  const sliderWidth = 22
  const cursorRadius = sliderWidth/2
</script>

<div class="grid grid-medium" style="--slider-width: {sliderWidth}px;">
  <Plane {hue} {saturation} {lightness} {cursorRadius} gridColumn=0 gridRow=0 on:colorchange={(e) => hex = e.detail}/>
  <HueSlider on:colorchange={(e) => hue = e.detail} class="test"/>
  <LightnessSlider on:lightnesschange={(e) => lightness = e.detail}/>
  <SaturationSlider {hue} {lightness} on:saturationchange={(e) => saturation = e.detail}/>
</div>

<style>
  .grid {
    display: grid;
    grid-template-columns: 1fr repeat(3, var(--slider-width));
    grid-template-rows: 1fr;
    row-gap: 0.5rem;
    column-gap: 0.75rem;
    width: 100%;
    height: 100%;
  }
  /* It's best to clearly and explicitly define grid coordinates for each canvas in one place */
  .grid-medium :global(.color-plane) {
    grid-column: 1;
    grid-row: 1;
  }
  .grid-medium :global(.hue-slider) {
    grid-column: 2;
    grid-row: 1;
  }
  .grid-medium :global(.lightness-slider) {
    grid-column: 3;
    grid-row: 1;
  }
  .grid-medium :global(.saturation-slider) {
    grid-column: 4;
    grid-row: 1;
  }
</style>

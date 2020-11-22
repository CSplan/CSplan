<script>
  import HueSlider from './hue.svelte'
  import LightnessSlider from './lightness.svelte'
  import SaturationSlider from './saturation.svelte'
  import Plane from './plane.svelte'
  let hue = 0
  let saturation = 0
  let lightness = 0
  // Slider width MUST be declared in px, because radii for all cursors is calculated as r/2
  const sliderWidth = 16
  const cursorRadius = sliderWidth/2
  const sideways = true
</script>

<div class="card grid" style="--slider-width: {sliderWidth}px;">
  <Plane {hue} {lightness} {cursorRadius} {saturation}/>
  <HueSlider on:colorchange={(e) => hue = e.detail} {sideways}/>
  <LightnessSlider on:lightnesschange={(e) => lightness = e.detail} {sideways}/>
  <SaturationSlider {hue} {lightness} on:saturationchange={(e) => saturation = e.detail} {sideways}/>
</div>

<style>
  .grid {
    margin-top: 10rem;
    padding: 0.5rem;
    display: grid;
    grid-template-columns: 1fr repeat(3, var(--slider-width));
    grid-template-rows: 1fr repeat(3, var(--slider-width));
    row-gap: 0.5rem;
    column-gap: 0.75rem;
    width: 300px;
    height: 200px;
  }
</style>

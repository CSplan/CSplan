<script>
  import HueSlider from './hue.svelte'
  import LightnessSlider from './lightness.svelte'
  import Plane from './plane.svelte'
  let hue = 0
  let lightness = 0
  // Slider width MUST be declared in px, because radii for all cursors is calculated as r/2
  const sliderWidth = 24
  const cursorRadius = sliderWidth/2
</script>

<div class="card grid" style="--slider-width: {sliderWidth}px;">
  <Plane {hue} {lightness} {cursorRadius}/>
  <HueSlider on:colorchange={(e) => hue = e.detail}/>
  <LightnessSlider on:lightnesschange={(e) => lightness =e.detail}/>
</div>

<style>
  .grid {
    margin-top: 10rem;
    padding: 0.5rem;
    display: grid;
    grid-template-columns: 1fr repeat(2, var(--slider-width));
    grid-template-rows: 1fr 40px;
    row-gap: 0.5rem;
    column-gap: 0.75rem;
    min-width: 600px;
    min-height: 400px;
  }
</style>

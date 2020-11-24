<script>
  import { createEventDispatcher, onMount } from 'svelte'
  import { SliderCanvas } from './canvas'

  let canvasEl
  /** @type {import('./canvas'.SliderCanvas)}*/
  let canvas
  /** @type {CanvasRenderingContext2D} */
  let ctx

  const dispatch = createEventDispatcher()

  // Height, width, radius
  export let sideways = false
  let h = 0
  let w = 0
  let r = 0
  $: r = sideways ? h/2 : w/2
  // Position of slider
  let pos = 0
  let moveCursor = false
  // Hue for calculating gradient
  export let hue = 0
  // Lightness for calculating saturation value
  export let lightness = 0

  function updateCursor(evt) {
    if (!moveCursor) {
      return
    }
    const slider = sideways ? evt.pageX - canvas.rect.left : evt.pageY - canvas.rect.top
    const max = sideways ? w - r : h - r
    if (slider < r) {
      pos = r
    } else if (slider > max) {
      pos = max
    } else {
      pos = slider
    }
  }

  // DOM elements and references
  onMount(() => {
    // Setup canvas
    canvas = new SliderCanvas(canvasEl, sideways)
    h = canvas.rect.height
    w = canvas.rect.width
    r = sideways ? h/2 : w/2
    pos = r
    ctx = canvas.ctx
    
    // Start drawing loop
    draw()
  })

  let oldPos = null
  let oldHue = null
  function draw() {
    if (pos === oldPos && hue === oldHue) {
      requestAnimationFrame(draw)
      return
    } else {
      oldPos = pos
      oldHue = hue
    }
    drawSlider()
    drawCursor()
    emitSaturation()
    requestAnimationFrame(draw)
  }
  function drawSlider() {
    // Create saturation gradient
    const gradient = sideways ? ctx.createLinearGradient(w - r, r, r, r) : ctx.createLinearGradient(r, h - r, r, r)
    for (let i = 0; i <= 100; i++) {
      gradient.addColorStop(i/100, `hsl(${hue}, ${i}%, 50%)`)
    }
    ctx.fillStyle = gradient
    canvas.drawSlider()
  }
  function drawCursor() {
    ctx.fillStyle = 'white'
    canvas.drawCursor(pos)
  }
  function emitSaturation() {
    const pixel = sideways ? ctx.getImageData(pos, r, 1, 1) : ctx.getImageData(r, pos, 1, 1)
    const rgb = Array.prototype.slice.call(pixel.data, 0, 3)
    dispatch('saturationchange', parseSaturation(rgb))
  }
  function parseSaturation(rgb) {
    const r = rgb[0]/255
    const g = rgb[1]/255
    const b = rgb[2]/255
    const cmax = Math.max(r, g, b)
    const cmin = Math.min(r, g, b)
    if (lightness > 0.5) {
      return (cmax - cmin) / (2 - cmax - cmin)
    } else {
      return (cmax - cmin) / (cmax + cmin)
    }
  }
</script>

<svelte:window on:mouseup={() => moveCursor = false} on:mousemove={updateCursor}/>

<canvas bind:this={canvasEl} class="saturation-slider" on:mousedown={() => moveCursor = true} on:mousedown={updateCursor}/>

<style>
  canvas {
    height: 100%;
    width: 100%;
  }
</style>

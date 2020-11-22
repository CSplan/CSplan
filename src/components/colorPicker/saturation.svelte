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
  let h = 0
  let w = 0
  let r = 0
  $: r = w/2
  // Position of slider
  let posY = 0
  let moveCursor = false
  // Hue for calculating gradient
  export let hue = 0
  // Lightness for calculating saturation value
  export let lightness = 0

  function updateCursor(evt) {
    if (!moveCursor) {
      return
    }
    const y = evt.pageY - canvas.rect.top
    if (y < r) {
      posY = r
    } else if (y > canvas.rect.height - r) {
      posY = canvas.rect.height - r
    } else {
      posY = y
    }
  }

  // DOM elements and references
  onMount(() => {
    // Setup canvas
    canvas = new SliderCanvas(canvasEl)
    h = canvas.rect.height
    w = canvas.rect.width
    r = w/2
    posY = r
    ctx = canvas.ctx
    
    // Start drawing loop
    draw()
  })

  function draw() {
    drawSlider()
    drawCursor()
    emitSaturation()
    requestAnimationFrame(draw)
  }
  function drawSlider() {
    // Create saturation gradient
    const gradient = ctx.createLinearGradient(r, h - r, r, r)
    for (let i = 0; i <= 100; i++) {
      gradient.addColorStop(i/100, `hsl(${hue}, ${i}%, 50%)`)
    }
    ctx.fillStyle = gradient
    canvas.drawSlider()
  }
  function drawCursor() {
    ctx.fillStyle = 'white'
    canvas.drawCursor(posY)
  }
  function emitSaturation() {
    const pixel = ctx.getImageData(r, posY, 1, 1)
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

<canvas bind:this={canvasEl} on:mousedown={() => moveCursor = true} on:mousedown={updateCursor}/>

<style>
  canvas {
    height: 100%;
  }
</style>

<script>
  import { createEventDispatcher, onMount } from 'svelte'
  import { SliderCanvas } from './canvas'

  /** @type {HTMLCanvasElement} */
  let canvasEl
  /** @type {import('./canvas'.SliderCanvas)} */
  let canvas
  /** @type {CanvasRenderingContext2D} */
  let ctx

  // Height, width, radius
  export let sideways = false
  let h = 0
  let w = 0
  let r = 0
  $: r = sideways ? h/2 : w/2
  // Position of slider
  let pos = 0
  let moveCursor = false

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

  const dispatch = createEventDispatcher()
  onMount(() => {
    canvas = new SliderCanvas(canvasEl, sideways)
    // Get height, width, and calculate border radius
    h = canvas.rect.height
    w = canvas.rect.width
    r = sideways ? h/2 : w/2
    pos = r
    ctx = canvas.ctx
    // Start the rendering loop
    draw()
  })

  let oldPos = pos
  function draw() {
    // Skip redrawing if the cursor position hasn't changed
    if (pos === oldPos) {
      requestAnimationFrame(draw)
      return
    } else {
      oldPos = pos
    }
    drawSlider()
    drawCursor()
    emitColor()
    requestAnimationFrame(draw)
  }

  function drawSlider() {
    // Create and fill a HSL gradient
    const gradient = sideways ? ctx.createLinearGradient(r, r, w - r, r) : ctx.createLinearGradient(r, r, r, h - r)
    for (let i = 0; i < 330; i++) {
      gradient.addColorStop(i/330, `hsl(${i}, 100%, 50%)`)
    }
    ctx.fillStyle = gradient
    canvas.drawSlider()
  }

  function drawCursor() {
    ctx.fillStyle = 'white'
    canvas.drawCursor(pos)
  }

  function emitColor() {
    const pixel = sideways ? ctx.getImageData(pos, r, 1, 1) : ctx.getImageData(r, pos, 1, 1)
    const rgb = Array.prototype.slice.call(pixel.data, 0, 3)
    dispatch('colorchange', parseHue(rgb))
  }
  function parseHue(rgb) {
    const r = rgb[0]
    const b = rgb[1]
    const g = rgb[2]
    const cmin = Math.min(r, g, b)
    const cmax = Math.max(r, g, b)
    const delta = cmax - cmin

    let h = 0
    switch (cmax) {
    case r:
      h = (g - b) / delta
      break
    case g:
      h = (b - r) / delta + 2
      break
    case b:
      h = (r - g) / delta + 4
      break
    }

    // Convert hue into a correct degree value
    h = Math.round(h * 60)
    return h <= 0 ? 0 - h : 360 - h
  }
</script>

<svelte:window on:mouseup={() => moveCursor = false} on:mousemove={updateCursor}/>

<canvas bind:this={canvasEl} class="hue-slider" on:mousedown={() => moveCursor = true} on:mousedown={updateCursor}/>

<style>
  .hue-slider {
    height: 100%;
    width: 100%;
  }
</style>

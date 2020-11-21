<script>
  import { createEventDispatcher, onDestroy, onMount, tick } from 'svelte'
import { SliderCanvas } from './canvas';

  /** @type {import('./canvas'.SliderCanvas)} */
  let canvas
  /** @type {CanvasRenderingContext2D} */
  let ctx

  // Exported ID and other color values
  export let id = ''
  // Height, width, radius
  let h = 0
  let w = 0
  let r = 0
  $: r = w/2
  // Position of slider
  let posY = 0
  let moveCursor = false


  function mousemove(evt) {
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

  const dispatch = createEventDispatcher()
  onMount(() => {
    canvas = new SliderCanvas(`#${id}`)
    // Get height, width, and calculate border radius
    canvas.getDimensions()
    h = canvas.rect.height
    w = canvas.rect.width
    r = w/2
    posY = h/2
    ctx = canvas.ctx
    // Start the rendering loop
    draw()
  })

  let oldY = posY
  function draw() {
    // Skip redrawing if the cursor position hasn't changed
    if (posY === oldY) {
      requestAnimationFrame(draw)
      return
    } else {
      oldY = posY
    }
    drawSlider()
    drawCursor()
    emitColor()
    requestAnimationFrame(draw)
  }

  function drawSlider() {
    // Create and fill a HSL gradient
    const gradient = ctx.createLinearGradient(r, r, r, h - r)
    for (let i = 0; i < 330; i++) {
      gradient.addColorStop(i/330, `hsl(${i}, 100%, 50%)`)
    }
    ctx.fillStyle = gradient
    canvas.drawSlider()
  }

  function drawCursor() {
    ctx.fillStyle = 'white'
    canvas.drawCursor(posY)
  }

  function emitColor() {
    const pixel = ctx.getImageData(r, posY, 1, 1)
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

<svelte:window on:mouseup={() => moveCursor = false} on:mousemove={mousemove}/>

<canvas {id} class="hue-slider" on:mousedown={() => moveCursor = true} on:mousedown={mousemove}/>

<style>
  .hue-slider {
    grid-column: 2;
    height: 100%;
  }
</style>

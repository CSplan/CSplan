<!-- Lightness slider used to control the radial gradient shown on the color plane -->


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
  // Lightness data for calculating cursor color
  let lightness = 0

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
    pos = sideways ? w - r : h - r
    ctx = canvas.ctx
    
    // Start drawing loop
    draw()
  })

  let oldPos = pos
  function draw() {
    if (pos === oldPos) {
      requestAnimationFrame(draw)
      return
    } else {
      oldPos = pos
    }

    drawSlider()
    emitLightness()
    drawCursor()
    requestAnimationFrame(draw)
  }

  function drawSlider() {
    // Lightness gradient
    const gradient = sideways ? ctx.createLinearGradient(r, r, w - r, r) : ctx.createLinearGradient(r, r, r, h - r)
    gradient.addColorStop(0, 'white')
    gradient.addColorStop(1, 'black')
    ctx.fillStyle = gradient
    canvas.drawSlider()
  }
  function drawCursor() {
    let f = 255
    if (f - 255 * lightness < 30) {
      f = 10 * (255 - (255 * lightness))
    }
    ctx.fillStyle = `rgb(${f}, ${f}, ${f})`
    canvas.drawCursor(pos)
  }
  function emitLightness() {
    const pixel = sideways ? ctx.getImageData(pos, r, 1, 1) : ctx.getImageData(r, pos, 1, 1)
    const rgb = Array.prototype.slice.call(pixel.data, 0, 3)
    lightness = parseLightness(rgb)
    dispatch('lightnesschange', lightness)
  }
  function parseLightness(rgb) {
    const r = rgb[0]
    const g = rgb[1]
    const b = rgb[2]
    
    return (Math.max(r, g, b) + Math.min(r, g, b)) / 510
  }
</script>

<canvas bind:this={canvasEl} class="lightness-slider" on:mousedown={(e) => moveCursor = true} on:mousedown={updateCursor}/>

<svelte:window on:mousemove={updateCursor} on:mouseup={() => moveCursor = false}/>

<style>
  .lightness-slider {
    height: 100%;
    width: 100%;
  }
</style>

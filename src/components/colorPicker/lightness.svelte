<!-- Lightness slider used to control the radial gradient shown on the color plane -->


<script>
  import { createEventDispatcher, onMount } from 'svelte'
  import { SliderCanvas } from './canvas'

  /** @type {import('./canvas'.SliderCanvas)}*/
  let canvas
  /** @type {CanvasRenderingContext2D} */
  let ctx

  const dispatch = createEventDispatcher()

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
  // Lightness data for calculating cursor color
  let lightness = 0

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

  // DOM elements and references
  onMount(() => {
    // Setup canvas
    canvas = new SliderCanvas(`#${id}`)
    h = canvas.rect.height
    w = canvas.rect.width
    r = w/2
    posY = h/2
    ctx = canvas.ctx
    
    // Start drawing loop
    draw()
  })

  let oldY = posY
  function draw() {
    if (posY === oldY) {
      requestAnimationFrame(draw)
      return
    } else {
      oldY = posY
    }

    drawSlider()
    emitLightness()
    drawCursor()
    requestAnimationFrame(draw)
  }

  function drawSlider() {
    // Lightness gradient
    const gradient = ctx.createLinearGradient(r, r, r, h - r)
    gradient.addColorStop(0, 'white')
    gradient.addColorStop(1, 'black')
    ctx.fillStyle = gradient
    canvas.drawSlider()
  }
  function drawCursor() {
    const f = 355 - Math.round(lightness * 255)
    ctx.fillStyle = `rgb(${f}, ${f}, ${f})`
    canvas.drawCursor(posY)
  }
  function emitLightness() {
    const pixel = ctx.getImageData(r, posY, 1, 1)
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

<canvas {id} class="lightness-slider" on:mousedown={(e) => moveCursor = true} on:mousedown={mousemove}/>

<svelte:window on:mousemove={mousemove} on:mouseup={() => moveCursor = false}/>

<style>
  .lightness-slider {
    height: 100%;
  }
</style>

<!-- Lightness slider used to control the radial gradient shown on the color plane -->


<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte'
  import { SliderCanvas } from './canvas'
  import { parseLightness } from './parse-lightness'

  // Canvas info
  let canvasEl: HTMLCanvasElement
  let canvas: SliderCanvas

  const dispatch = createEventDispatcher()

  // Sideways vs vertical slider
  export let sideways = false
  // Position of slider
  let pos = 0
  let moveCursor = false
  // Lightness data for calculating cursor color
  let lightness = 0

  function updateCursor(evt: MouseEvent): void {
    const { w, h, r } = canvas
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
    const { w, h, r } = canvas
    pos = sideways ? w - r : h - r
    
    // Start drawing loop
    draw()
  })

  let oldPos = pos
  function draw(): void {
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

  function drawSlider(): void {
    const { ctx, w, h, r } = canvas 
    // Lightness gradient
    const gradient = sideways ? ctx.createLinearGradient(r, r, w - r, r) : ctx.createLinearGradient(r, r, r, h - r)
    gradient.addColorStop(0, 'white')
    gradient.addColorStop(1, 'black')
    ctx.fillStyle = gradient
    canvas.drawSlider()
  }
  function drawCursor(): void {
    let f = 255
    if (f - 255 * lightness < 30) {
      f = 10 * (255 - (255 * lightness))
    }
    canvas.ctx.fillStyle = `rgb(${f}, ${f}, ${f})`
    canvas.drawCursor(pos)
  }
  function emitLightness(): void {
    const { ctx, r } = canvas
    const pixel = sideways ? ctx.getImageData(pos, r, 1, 1) : ctx.getImageData(r, pos, 1, 1)
    const rgb = Uint8Array.prototype.slice.call(pixel.data, 0, 3)
    lightness = parseLightness(rgb)
    dispatch('lightnesschange', lightness)
  }

  // Copied from plane.svelte
  function onWindowMouseup(): void {
    if (moveCursor) {
      document.addEventListener('click', (evt) => {
        evt.stopPropagation()
      }, {
        once: true,
        capture: true
      })
    }
    moveCursor = false
  }
</script>

<svelte:window on:mousemove={updateCursor} on:mouseup={onWindowMouseup}/>

<canvas bind:this={canvasEl} class="lightness-slider"
  on:mousedown={() => moveCursor = true}
  on:mousedown={updateCursor}
  on:mouseup|stopPropagation={() => moveCursor = false}/>

<style>
  .lightness-slider {
    height: 100%;
    width: 100%;
  }
</style>

<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte'
  import { SliderCanvas } from './canvas'

  let canvasEl: HTMLCanvasElement
  let canvas: SliderCanvas

  const dispatch = createEventDispatcher()

  // Sideways vs regular slider
  export let sideways = false
  // Position of slider
  let pos = 0
  let moveCursor = false
  // Hue for calculating gradient
  export let hue = 0
  // Lightness for calculating saturation value
  export let lightness = 0

  function updateCursor(evt: PointerEvent): void {
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
    pos = canvas.r

    // Start drawing loop
    draw()
  })

  let oldPos: number|null = null
  let oldHue: number|null = null
  function draw(): void {
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
  function drawSlider(): void {
    const { ctx, w, h, r } = canvas
    // Create saturation gradient
    const gradient = sideways ? ctx.createLinearGradient(w - r, r, r, r) : ctx.createLinearGradient(r, h - r, r, r)
    for (let i = 0; i <= 100; i++) {
      gradient.addColorStop(i/100, `hsl(${hue}, ${i}%, 50%)`)
    }
    ctx.fillStyle = gradient
    canvas.drawSlider()
  }
  function drawCursor(): void {
    canvas.ctx.fillStyle = 'white'
    canvas.drawCursor(pos)
  }
  function emitSaturation(): void {
    const { ctx, r } = canvas
    const pixel = sideways ? ctx.getImageData(pos, r, 1, 1) : ctx.getImageData(r, pos, 1, 1)
    const rgb = Uint8Array.prototype.slice.call(pixel.data, 0, 3)
    dispatch('saturationchange', parseSaturation(rgb))
  }
  function parseSaturation(rgb: Uint8Array): number {
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

<svelte:window on:pointermove={updateCursor} on:pointerup={onWindowMouseup}/>

<canvas bind:this={canvasEl} class="saturation-slider"
  on:pointerdown={() => moveCursor = true}
  on:pointerdown={updateCursor}
  on:pointerup|stopPropagation={() => moveCursor = false}/>

<style>
  canvas {
    height: 100%;
    width: 100%;
  }
</style>

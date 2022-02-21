<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte'
  import { SliderCanvas } from './canvas'

  let canvasEl: HTMLCanvasElement
  let canvas: SliderCanvas

  // Height, width, radius
  export let sideways = false
  // Position of slider
  let pos = 0
  let moveCursor = false

  function updateCursor(evt: MouseEvent): void {
    if (!moveCursor) {
      return
    }
    const { w, h, r } = canvas
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
    pos = canvas.r
    // Start the rendering loop
    draw()
  })

  let oldPos = pos
  function draw(): void {
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

  function drawSlider(): void {
    const { ctx, w, h , r } = canvas
    // Create and fill a HSL gradient
    const gradient = sideways ? ctx.createLinearGradient(r, r, w - r, r) : ctx.createLinearGradient(r, r, r, h - r)
    for (let i = 0; i < 330; i++) {
      gradient.addColorStop(i/330, `hsl(${i}, 100%, 50%)`)
    }
    ctx.fillStyle = gradient
    canvas.drawSlider()
  }

  function drawCursor(): void {
    canvas.ctx.fillStyle = 'white'
    canvas.drawCursor(pos)
  }

  function emitColor(): void {
    const { ctx, r } = canvas
    const pixel = sideways ? ctx.getImageData(pos, r, 1, 1) : ctx.getImageData(r, pos, 1, 1)
    const rgb = Uint8Array.prototype.slice.call(pixel.data, 0, 3)
    dispatch('colorchange', parseHue(rgb))
  }
  function parseHue(rgb: Uint8Array): number {
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

<canvas bind:this={canvasEl} class="hue-slider"
  on:mousedown={() => moveCursor = true}
  on:mousedown={updateCursor}
  on:mouseup|stopPropagation={() => moveCursor = false}/>

<style>
  .hue-slider {
    height: 100%;
    width: 100%;
  }
</style>

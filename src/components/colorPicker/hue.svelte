<script context="module">
  // Rendering context
  /** @type {HTMLCanvasElement} */
  let canvas
  /** @type {CanvasRenderingContext2D} */
  let ctx

  /** @type {DOMRect} */
  let rect = null // Cache bounding client rect of the canvas, as this computation is costly to the drawing loop
  export function getDimensions() {
    rect = canvas.getBoundingClientRect()
    // Canvas width and height has to be manually updated
    canvas.height = rect.height
    canvas.width = rect.width
  }
</script>

<script>
  import { createEventDispatcher, onDestroy, onMount, tick } from 'svelte'

  // Human-friendly curve of HSL stops
  const stops = [
    {
      pos: 0,
      value: 0
    },
    {
      pos: 0.1,
      value: 30
    },
    {
      pos: 0.2,
      value: 45
    },
    {
      pos: 0.3,
      value: 60
    },
    {
      pos: 0.45,
      value: 120
    },
    {
      pos: 0.5,
      value: 180
    },
    {
      pos: 0.6,
      value: 200
    },
    {
      pos: 0.7,
      value: 240
    },
    {
      pos: 0.8,
      value: 270
    },
    {
      pos: 0.9,
      value: 285
    },
    {
      pos: 1,
      value: 300
    }
  ]

  // Y value of cursor position
  let posY = 0
  let cursorIsHeld = false

  // Get height, width, border radius
  let h = 0
  let w = 0
  let r = 0
  $: r = w/2
  // ID unique to color picker slider
  export let id = 'color-picker-hue-slider'

  function mousemove(evt) {
    if (!cursorIsHeld) {
      return
    }
    const y = evt.pageY - rect.top
    if (y < r) {
      posY = r
    } else if (y > rect.height - r) {
      posY = rect.height - r
    } else {
      posY = y
    }
  }

  const byteToHex = {}
  const dispatch = createEventDispatcher()
  onMount(() => {
    canvas = document.querySelector(`#${id}`)
    ctx = canvas.getContext('2d')
    // Get height, width, and calculate border radius
    getDimensions()
    h = rect.height
    w = rect.width
    r = w/2
    posY = r
    // Precompute hex -> octet pairings
    for (let b = 0; b <= 0xff; b++) {
      byteToHex[b] = b.toString(16).padStart(2, '0')
    }
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
    ctx.beginPath()
    // Draw inner rectangle
    ctx.rect(0, r, w, h - 2*r)
    // Followed by two pairs of arcs to make rounded corners
    // Upper arcs
    ctx.moveTo(0, r)
    ctx.arcTo(0, 0, r, 0, r)
    ctx.arcTo(w, 0, w, r, r)
    // Bottom arcs
    ctx.moveTo(0, h - r)
    ctx.arcTo(0, h, r, h, r)
    ctx.arcTo(w, h, w, h - r, r)

    // Create and fill a HSL gradient
    const gradient = ctx.createLinearGradient(r, r, r, h - r)
    for (let i = 0; i < 330; i++) {
      gradient.addColorStop(i/330, `hsl(${i}, 100%, 50%)`)
    }
    ctx.fillStyle = gradient
    ctx.fill()
  }

  function drawCursor() {
    ctx.beginPath()
    ctx.arc(r, posY, r, 0, 2*Math.PI)
    ctx.arc(r, posY, r/2, 0, 2*Math.PI, true)
    ctx.fillStyle = 'white'
    ctx.fill()
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

<svelte:window on:mouseup={() => cursorIsHeld = false} on:mousemove={mousemove}/>

<canvas {id} class="hue-slider" on:mousedown={() => cursorIsHeld = true}/>

<style>
  .hue-slider {
    grid-column: 2;
    height: 100%;
  }
</style>

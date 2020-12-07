<!-- This component makes up the rectangular plane for selected color lightness -->
<script>
  import { createEventDispatcher, onMount } from 'svelte'
  import { PlaneCanvas } from './canvas'

  let canvasEl
  /** @type {import('./canvas'.PlaneCanvas)} */
  let canvas
  /** @type {CanvasRenderingContext2D} */
  let ctx

  export let hue = 0
  export let saturation = 0
  export let lightness = 0
  // Height, width, diagonal
  let h = 0
  let w = 0
  let diag = 0
  // X and Y position of cursor
  let posX = 0
  let posY = 0
  let moveCursor = false
  // Cursor radius
  export let cursorRadius
  let r = 0
  $: r = cursorRadius

  // Handle mouse movement/clicks
  function updateCursor(evt) {
    if (!moveCursor) {
      return
    }
    const x = evt.pageX - canvas.rect.left
    const y = evt.pageY - canvas.rect.top
    const xMax = canvas.rect.width - 1
    const yMax = canvas.rect.height - 1
    if (x < 0) {
      posX = 0
    } else if (x > xMax) {
      posX = xMax
    } else {
      posX = x
    }
    if (y < 0) {
      posY = 0
    } else if (y > yMax) {
      posY = yMax
    } else {
      posY = y
    }
  }

  const byteToHex = {}
  const dispatch = createEventDispatcher()

  onMount(() => {
    // Query canvas
    canvas = new PlaneCanvas(canvasEl)
    ctx = canvas.ctx
    h = canvas.rect.height
    w = canvas.rect.width
    diag = Math.sqrt(h**2 + w**2)
    // Initially position the cursor in the top right corner
    posX = w - r
    posY = r
    // Precompute octet -> hex pairings for color conversions from binary
    for (let b = 0; b <= 0xff; b++) {
      byteToHex[b] = b.toString(16).padStart(2, '0')
    }
    // Start the drawing loop
    draw()
  })

  let oldX = null
  let oldY = null
  let oldHue = null
  let oldSaturation = null
  let oldLightness = null
  // Number of frames to wait before emitting color changes,
  // Setting this to 2 prevents a bug of initially emitting a color change without any user input
  // Note that this is a DEPRECATED WORKAROUND: the ideal solution to this problem is to initially set the position of each slider as well as the plane based on coordinates stored alongside the tag in the DB, so that the initial color emitted by the color picker is the same color previously set by the user
  let waitFrames = 2
  function draw() {
    // If the cursor position, hue, and lightness have all stayed the same, skip redrawing
    if (posX === oldX && posY === oldY && hue === oldHue && saturation === oldSaturation && lightness === oldLightness) {
      requestAnimationFrame(draw)
      return
    } else {
      oldX = posX
      oldY = posY
      oldHue = hue
      oldSaturation = saturation
      oldLightness = lightness
    }
    drawPlane()
    if (!waitFrames) {
      emitColorChange()
    } else {
      waitFrames--
    }
    drawCursor()
    requestAnimationFrame(draw)
  }

  function drawPlane() {
    const l = Math.round(lightness * 100)
    const gradient = canvas.ctx.createRadialGradient(0, h, 0, 0, h, diag)
    if (l < 50) {
      for (let i = l; i <= 50; i++) {
        gradient.addColorStop(i/50, `hsl(${hue}, ${Math.round(saturation * 100)}%, ${i}%)`)
      }
    } else {
      for (let i = l; i >= 50; i--) {
        gradient.addColorStop((100 - i)/50, `hsl(${hue}, ${Math.round(saturation * 100)}%, ${i}%)`)
      }
    }
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, w, h)
  }
  function drawCursor() {
    ctx.fillStyle = 'white'
    canvas.drawCursor(posX, posY, r)
  }
  function emitColorChange() {
    const pixel = ctx.getImageData(posX, posY, 1, 1)
    const rgb = Array.prototype.slice.call(pixel.data, 0, 3)
    const hex = '#' + rgb.map(b => byteToHex[b]).join('')
    dispatch('colorchange', hex)
  }
</script>

<svelte:window on:mousemove={updateCursor} on:mouseup={() => moveCursor = false}/>

<canvas bind:this={canvasEl} class="color-plane" on:mousedown={() => moveCursor = true} on:mousedown={updateCursor}/>

<style>
  .color-plane {
    height: 100%;
    width: 100%;
  }
</style>

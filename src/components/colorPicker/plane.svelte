<!-- This component makes up the rectangular plane for selected color lightness -->
<script>
  import { onMount } from 'svelte'
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
    if (x < 0) {
      posX = 0
    } else if (x > canvas.rect.width) {
      posX = canvas.rect.width
    } else {
      posX = x
    }
    if (y < 0) {
      posY = 0
    } else if (y > canvas.rect.height) {
      posY = canvas.rect.height
    } else {
      posY = y
    }
  }

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
    // Start the drawing loop
    draw()
  })

  let oldX = null
  let oldY = null
  let oldHue = null
  let oldSaturation = null
  let oldLightness = null
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
</script>

<svelte:window on:mousemove={updateCursor} on:mouseup={() => moveCursor = false}/>

<canvas bind:this={canvasEl} class="color-plane" on:mousedown={() => moveCursor = true} on:mousedown={updateCursor}></canvas>

<style>
  .color-plane {
    grid-row: 1;
    grid-column: 1;
    height: 100%;
  }
</style>

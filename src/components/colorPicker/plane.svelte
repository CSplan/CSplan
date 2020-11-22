<!-- This component makes up the rectangular plane for selected color lightness -->
<script>
  import { onMount } from 'svelte'
  import { Canvas, PlaneCanvas } from './canvas'

  /** @type {import('./canvas'.PlaneCanvas)} */
  let canvas
  /** @type {CanvasRenderingContext2D} */
  let ctx

  export let id = ''
  export let hue = 0
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
  const r = 15

  // Handle mouse movement/clicks
  function mousemove(evt) {
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
    canvas = new PlaneCanvas(`#${id}`)
    ctx = canvas.ctx
    h = canvas.rect.height
    w = canvas.rect.width
    diag = Math.sqrt(h**2 + w**2)
    // Start the drawing loop
    draw()
  })

  let oldX = null
  let oldY = null
  let oldHue = null
  let oldLightness = null
  function draw() {
    // If the cursor position, hue, and lightness have all stayed the same, skip redrawing
    if (posX === oldX && posY === oldY && hue === oldHue && lightness === oldLightness) {
      requestAnimationFrame(draw)
      return
    } else {
      oldX = posX
      oldY = posY
      oldHue = hue
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
        gradient.addColorStop(i/50, `hsl(${hue}, 100%, ${i}%)`)
      }
    } else {
      for (let i = l; i >= 50; i--) {
        gradient.addColorStop((100 - i)/50, `hsl(${hue}, 100%, ${i}%)`)
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

<svelte:window on:mousemove={mousemove} on:mouseup={() => moveCursor = false}/>

<canvas {id} class="color-plane" on:mousedown={() => moveCursor = true} on:mousedown={mousemove}></canvas>

<style>
  .color-plane {
    grid-row: 1;
    grid-column: 1;
    height: 100%;
  }
</style>
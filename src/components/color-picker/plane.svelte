<!-- This component makes up the rectangular plane for selected color lightness -->
<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte'
  import { PlaneCanvas } from './canvas'

  let canvasEl: HTMLCanvasElement
  let canvas: PlaneCanvas

  export let hue = 0
  export let saturation = 0
  export let lightness = 0
  // Diagonal used for gradients
  let diag = 0
  // X and Y position of cursor
  let posX = 0
  let posY = 0
  let moveCursor = false
  // Cursor radius
  export let cursorRadius: number

  // Handle mouse movement/clicks
  function updateCursor(evt: MouseEvent): void {
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

  const byteToHex: { [byte: number]: string} = {}
  const dispatch = createEventDispatcher()

  onMount(() => {
    // Query canvas
    canvas = new PlaneCanvas(canvasEl)
    diag = Math.sqrt(canvas.h**2 + canvas.w**2)
    // Initially position the cursor in the top right corner
    posX = canvas.w - cursorRadius
    posY = cursorRadius
    // Precompute octet -> hex pairings for color conversions from binary
    for (let b = 0; b <= 0xff; b++) {
      byteToHex[b] = b.toString(16).padStart(2, '0')
    }
    // Start the drawing loop
    draw()
  })

  // Store values to avoid re-rendering when nothing has changed
  let oldX: number|null = null
  let oldY: number|null = null
  let oldHue: number|null = null
  let oldSaturation: number|null = null
  let oldLightness: number|null = null
  // Number of frames to wait before emitting color changes,
  // Setting this to 2 prevents a bug of initially emitting a color change without any user input
  // Note that this is a DEPRECATED WORKAROUND: the ideal solution to this problem is to initially set the position of each slider as well as the plane based on coordinates stored alongside the tag in the DB, so that the initial color emitted by the color picker is the same color previously set by the user
  let waitFrames = 2
  function draw(): void {
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

  function drawPlane(): void {
    const { ctx, w, h } = canvas
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
  function drawCursor(): void {
    canvas.ctx.fillStyle = 'white'
    canvas.drawCursor(posX, posY, cursorRadius)
  }
  function emitColorChange(): void {
    const pixel = canvas.ctx.getImageData(posX, posY, 1, 1)
    const rgb = Array.prototype.slice.call(pixel.data, 0, 3)
    const hex = '#' + rgb.map(b => byteToHex[b]).join('')
    dispatch('colorchange', hex)
  }

  // If the cursor was set down inside the canvas but set up outside the canvas, 
  // prevent the following click event from propagating and causing unwanted side effects
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

<canvas bind:this={canvasEl} class="color-plane"
  on:mousedown={() => moveCursor = true}
  on:mousedown={updateCursor}
  on:mouseup|stopPropagation={() => moveCursor = false}/>

<style>
  .color-plane {
    height: 100%;
    width: 100%;
  }
</style>

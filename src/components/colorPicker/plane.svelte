<!-- This component makes up the rectangular plane for selected color lightness -->
<script>
  import { onMount } from 'svelte'
  import { Canvas } from './canvas'

  /** @type {import('./canvas'.CanvasInfo)} */
  let canvas

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

  onMount(() => {
    // Query canvas
    canvas = new Canvas(`#${id}`)
    h = canvas.rect.height
    w = canvas.rect.width
    diag = Math.sqrt(h**2 + w**2)
    // Start the drawing loop
    draw()
  })

  function draw() {
    drawPlane()
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
    canvas.ctx.fillStyle = gradient
    canvas.ctx.fillRect(0, 0, w, h)
  }
</script>

<canvas {id} class="color-plane"></canvas>

<style>
  .color-plane {
    grid-row: 1;
    grid-column: 1;
    height: 100%;
  }
</style>
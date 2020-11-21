<!-- This component makes up the rectangular plane for selected color saturation and luminance, where x corresponds to saturdation and y to luminance -->
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
  import { onMount } from 'svelte'
import { xlink_attr } from 'svelte/internal';


  export let id = ''
  export let hue = 0
  // Height, width, diagonal
  let h = 0
  let w = 0
  let diag = 0
  // X and Y position of cursor
  let posX = 0
  let posY = 0

  onMount(() => {
    // Query canvas
    canvas = document.querySelector(`#${id}`)
    ctx = canvas.getContext('2d')
    // Update dimensions
    getDimensions()
    h = rect.height
    w = rect.width
    diag = Math.sqrt(h**2 + w**2)
    // Start the drawing loop
    draw()
  })

  function draw() {
    drawPlane()
    requestAnimationFrame(draw)
  }

  function drawPlane() {
    const gradient = ctx.createRadialGradient(0, h, 0, 0, h, diag)
    const luminance = 0
    if (luminance < 50) {
      for (let i = luminance; i <= 50; i++) {
        gradient.addColorStop(i/50, `hsl(${hue}, 100%, ${i}%)`)
      }
    } else {
      for (let i = luminance; i >= 50; i--) {
        gradient.addColorStop((100 - i)/50, `hsl(${hue}, 100%, ${i}%)`)
      }
    }
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, w, h)
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
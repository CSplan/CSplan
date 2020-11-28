<!-- DEVELOPMENT COMPONENT - TO BE DELETED - color sample viewer being used to select a color palette -->
<script>
  import { onMount } from 'svelte'
  import { Canvas } from './canvas';

  let canvasEl
  /** @type {import('./canvas'.PlaneCanvas)} */
  let canvas
  /** @type {CanvasRenderingContext2D} */
  let ctx

  export let hex = ''
  onMount(() => {
    canvas = new Canvas(canvasEl)
    ctx = canvas.ctx
    draw()
  })

  let oldHex = null
  function draw() {
    if (hex === oldHex) {
      requestAnimationFrame(draw)
      return
    } else {
      oldHex = hex
    }
    console.log('%c'+hex, `color: ${hex};`)
    ctx.fillStyle = hex
    ctx.fillRect(0, 0, canvas.w, canvas.h)
    requestAnimationFrame(draw)
  }
</script>

<canvas bind:this={canvasEl} class="sample"></canvas>

<style>
  .sample {
    height: 100%;
    width: 100%;
  }
</style>
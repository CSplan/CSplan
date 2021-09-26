<script lang="ts">
  import { tick } from 'svelte'

  let files: FileList
  let displayCanvas: HTMLCanvasElement

  // Button/placeholder visibility
  let hasUpload = false

  async function onImageLoad(): Promise<void> {
    const file = files[0]

    // Display the profile picture
    hasUpload = true
    await tick()

    // Initialize canvas
    const rect = displayCanvas.getBoundingClientRect()
    const canvasW = rect.width
    displayCanvas.width = canvasW
    displayCanvas.height = canvasW

    // Load file as raw image
    const img = new Image()
    img.src = URL.createObjectURL(file)
    // Wait for the image to load
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onabort = () => reject()
    })

    // Crop the image to a square from the center
    let w = img.width,
      h = img.height,
      offsetX = 0,
      offsetY = 0

    const scale = canvasW / Math.min(w, h)
    if (w > h) {
      offsetX = (w - h) / 2
    } else if (h > w) {
      offsetY = (h - w) / 2
    }

    const ctx = displayCanvas.getContext('2d')!

    // Create a circular clipping region before drawing the image
    ctx.moveTo(canvasW / 2, 0)
    ctx.beginPath()
    ctx.arc(canvasW / 2, canvasW / 2, canvasW / 2, 0, 2*Math.PI)
    ctx.clip()
    ctx.drawImage(img, -offsetX * scale, -offsetY * scale, w * scale, h * scale)

    // Free the object URL when the image is not being used anymore
    URL.revokeObjectURL(img.src)
  }
</script>

<div class="user-picture">
  {#if !hasUpload}
    <i class="fas fa-user-circle"></i>
  {/if}
  <!-- svelte-ignore a11y-img-redundant-alt -->
  <canvas id="pfp-display" class:d-none={!hasUpload} alt="User Profile Picture" bind:this={displayCanvas}></canvas>

  <form class="pfp-form" on:submit|preventDefault>
    <label for="pfp">
      <i class="fas fa-upload"></i>
      <span>Select</span>
    </label>
    <input type="file" id="pfp" accept="image/png, image/jpeg" bind:files={files} on:change={onImageLoad}>

    <input type="submit" class:d-none={!hasUpload} value="Save">
  </form>
</div>

<style lang="scss">
  .user-picture {
    padding: 0.4rem 0.8rem;
    border: 1px solid #aaa;

    line-height: 1;
    padding: 0.8rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    grid-column: 1 / span 1;
    >i.fa-user-circle {
      font-size: 8.5rem;
    }

    canvas {
      width: 100%;
    }
  }

  form.pfp-form {
    width: 100%;
    text-align: center;
    margin-top: 0.5rem;
    label {
      display: block;
      padding: var(--padding-m);
      border-radius: 0.2rem;
      background: var(--background-dark);
      color: white;
      &:hover {
        box-shadow: inset 0 0 0 99em rgba(255,255,255,0.2);
      }
    }
    input {
      width: 100%;
    }
    input[type="file"] {
      display: none;
    }
  }
</style>
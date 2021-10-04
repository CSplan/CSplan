<script lang="ts">
  import { onMount, tick } from 'svelte'
  import { userPFP } from '../../../stores/user-profile-picture'
  import { formatError } from '$lib/error-format'
  import Spinner from '../../spinner.svelte'

  let files: FileList
  let displayCanvas: HTMLCanvasElement

  // State
  const enum States {
    Loading,
    Resting,
    Errored,
    Saving,
    Saved
  }
  let isEmpty = true
  let hasUpload = false
  let state = States.Loading
  let errorMsg = ''

  type CropDimensions = {
    sideLength: number
    scale: number
    offsetX: number
    offsetY: number
    w: number
    h: number
  }

  let croppedImage: Blob|undefined
  // Draw a preview of an image uploaded to the form and prepare a final crop to send to the API
  async function onImageLoad(): Promise<void> {
    const file = files[0]

    // Display the profile picture
    isEmpty = false
    await tick()


    // Load file as raw image
    const img = new Image()
    img.src = URL.createObjectURL(file)
    // Wait for the image to load
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onabort = () => reject()
    })

    // Crop the image to a square from the center
    const cropDimensions = crop(img)

    await draw(img, cropDimensions)

    // Create a 512x512 final crop of the image, ready to be encrypted and sent to the API
    croppedImage = await finalCrop(img, cropDimensions)
    // Allow form submission
    hasUpload = true

    // Free the object URL when the image is not being used anymore
    URL.revokeObjectURL(img.src)
  }

  // Crop an image to 512x512 and return a png-encoded blob
  async function finalCrop(img: HTMLImageElement, { sideLength, offsetX, offsetY, w, h }: CropDimensions): Promise<Blob> {
    // Use an invisible canvas to create a scaled and centered version of the image
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const scale = 512 / sideLength
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, -offsetX * scale, -offsetY * scale, w * scale, h * scale)

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob === null) {
          reject()
        }
        resolve(blob!)
      }, 'image/png')
    })
  }

  async function drawBorder(color: string, borderWidth = 2): Promise<void> {
    const ctx = displayCanvas.getContext('2d')!
    const w = displayCanvas.width

    ctx.strokeStyle = color
    for (let i = 0; i < borderWidth; i++) {
      ctx.arc(w / 2, w / 2, w / 2 - i, 0, 2*Math.PI)
      ctx.arc(w / 2, w / 2, w / 2 - i - 0.5, 0, 2*Math.PI) // Cheap anti-aliasing
      ctx.stroke()
    }
  }

  async function onSubmit(): Promise<void> {
    if (state !== States.Resting && state !== States.Errored) {
      return
    } 
    state = States.Saving
    try {
      await userPFP.create(croppedImage!)
      await new Promise((resolve) => {
        setTimeout(resolve, 5000)
      })
    } catch (err) {
      state = States.Errored
      if (err instanceof Error) {
        errorMsg = err.message
      } else {
        errorMsg = err as string
      }
      drawBorder(getComputedStyle(displayCanvas).getPropertyValue('--danger-red'))
      return
    }
    state = States.Saved
    setTimeout(() => {
      state = States.Resting
      setTimeout(() => {
        hasUpload = false
        croppedImage = undefined
      }, 350)
    }, 350)
  }

  onMount(async () => {
    try {
      await userPFP.init()
      if ($userPFP.exists) {
        isEmpty = false
        await tick()
        initCanvas()

        // Crop and draw the user's PFP
        const img = new Image()
        img.src = URL.createObjectURL($userPFP.image)
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onabort = reject
        })
        const cropDimensions = crop(img)
        await draw(img, cropDimensions)
      }
    } catch (err) {
      state = States.Errored
      if (err instanceof Error) {
        errorMsg = err.message
      } else {
        errorMsg = err as string
      }
    }
    state = States.Resting
  })

  // #region Image manipulation

  function initCanvas(): void {
    // Initialize canvas
    const rect = displayCanvas.getBoundingClientRect()
    const canvasW = rect.width
    displayCanvas.width = canvasW
    displayCanvas.height = canvasW
  }

  function crop(img: HTMLImageElement): CropDimensions {
    const canvasW = displayCanvas.width
    const w = img.width, h = img.height

    const sideLength = Math.min(w, h)
    const scale = canvasW / sideLength

    let offsetX = 0, offsetY = 0
    if (w > h) {
      offsetX = (w - h) / 2
    } else if (h > w) {
      offsetY = (h - w) / 2
    }

    return {
      sideLength,
      scale,
      offsetX,
      offsetY,
      w,
      h
    }
  }

  async function draw(img: HTMLImageElement, { offsetX, offsetY, w, h, scale }: CropDimensions): Promise<void> {
    const canvasW = displayCanvas.width

    let ctx = displayCanvas.getContext('2d')!

    // Create a circular clipping region before drawing the image
    ctx.moveTo(canvasW / 2, 0)
    ctx.beginPath()
    ctx.arc(canvasW / 2, canvasW / 2, canvasW / 2, 0, 2*Math.PI)
    ctx.clip()
    ctx.drawImage(img, -offsetX * scale, -offsetY * scale, w * scale, h * scale)
  }
  // #endregion
</script>

<div class="user-picture">
  {#if isEmpty}
    <i class="fas fa-user-circle"></i>
  {/if}
  <!-- svelte-ignore a11y-img-redundant-alt -->
  <canvas id="pfp-display" class:d-none={isEmpty} alt="User Profile Picture" bind:this={displayCanvas}></canvas>
  {#if state === States.Errored}
    <span class="error">{formatError(errorMsg)}</span>
  {/if}

  <form class="pfp-form" on:submit|preventDefault={onSubmit}>
    <label for="pfp">
      <i class="fas fa-upload"></i>
      <span>Select</span>
    </label>
    <input type="file" id="pfp" accept="image/png, image/jpeg" bind:files={files} on:change={onImageLoad}>

    <input type="submit"
      id="pfp-submit"
      class:d-none={!hasUpload}
      disabled={state === States.Saving}
      class:saved={state === States.Saved}
      value="Save">
    {#if state === States.Saving}
      <Spinner size="2.5rem" vm="0.5rem" message="Uploading"/>
    {/if}
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

    >span.error {
      margin-top: 0.5rem;
      color: var(--danger-red);
      text-align: center;
      font-family: monospace;
      font-size: 110%;
      white-space: pre-wrap;
    }
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
    input[type="submit"] {
      background: var(--bold-blue);
      &.saved {
        transition: background-color 200ms var(--cubic-out);
        background: rgb(0, 163, 87);
      }
    }
  }

  p.upload-message {
    margin-bottom: 0.5rem;
    margin-top: 0rem;
  }
</style>
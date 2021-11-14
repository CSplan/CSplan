<script lang="ts">
  import { onMount, tick } from 'svelte'
  import { userPFP } from '$stores/user-profile-picture'
  import { formatError, Visibilities } from '$lib'
  import Spinner from '$components/spinner.svelte'

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
  let visibility: Visibilities = Visibilities.Encrypted
  let visibilityIcon: string
  let showVisibilities = false
  $: switch (visibility) {
  case Visibilities.Encrypted:
    visibilityIcon = 'fas fa-lock'
    break
  case Visibilities.SemiPublic:
    visibilityIcon = 'far fa-eye-slash' // FIXME: Change to user-unlock with FA pro
    break
  case Visibilities.Public:
    visibilityIcon = 'fas fa-user'
  }

  // Draw a preview of an image uploaded to the form and prepare a final crop to send to the API
  async function onImageLoad(): Promise<void> {
    const file = files[0]

    // Display the profile picture
    await initCanvas()

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
      await userPFP.create(croppedImage!, visibility)
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
      if ($userPFP.image != null) {
        await initCanvas()

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

  async function initCanvas(): Promise<void> {
    // Initialize canvas
    isEmpty = false
    await tick()
    const rect = displayCanvas.getBoundingClientRect()
    const canvasW = rect.width
    displayCanvas.width = canvasW
    displayCanvas.height = canvasW
    await tick()
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

<svelte:window on:click={() => showVisibilities = false} />

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
    <label for="pfp" title="Upload a profile picture">
      <i class="fas fa-upload"></i>
    </label>
    <input type="file" id="pfp" accept="image/png, image/jpeg" bind:files={files} on:change={onImageLoad}>

    <details class="visibility" bind:open={showVisibilities} on:click|stopPropagation>
      <summary>
        <i class="visibility {visibilityIcon} clickable" title="{Visibilities[visibility]}"></i>
      </summary>
      <section class="visibilities">
        <header>Visibility</header>

        <label for="vis-encrypted">
          <i class="fas fa-lock"/>
          <span>Encrypted</span>
          <!-- FIXME: These indicator icons are ugly, will be removed when better control of icon texture is available w FA-pro -->
          <i class="{visibility === Visibilities.Encrypted ? 'fas' : 'far'} fa-circle indicator"></i>
        </label>
        <input type="radio" id="vis-encrypted" bind:group={visibility} value={Visibilities.Encrypted}>

        <label for="vis-semipublic">
          <i class="far fa-eye-slash"></i>
          <span>Semi-Public</span>
          <i class="{visibility === Visibilities.SemiPublic ? 'fas' : 'far'} fa-circle indicator"></i>
        </label>
        <input type="radio" disabled id="vis-semipublic">

        <label for="vis-public">
          <i class="fas fa-user"></i>
          <span>Public</span>
          <i class="{visibility === Visibilities.Public ? 'fas' : 'far'} fa-circle indicator"></i>
        </label>
        <input type="radio" id="vis-public" bind:group={visibility} value={Visibilities.Public}>


      </section>



    </details>

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
    justify-content: flex-start;
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

  details.visibility {
    position: relative;
  }
  i.visibility {
    display: block;
    text-align: right;
    // aligns with upload icon
    margin-top: 0.6rem;
 }
  section.visibilities {
    min-width: 10rem;
    font-size: 0.95rem;
    position: absolute;
    z-index: 1;
    right: 0;
    margin-top: 0.5rem;
    border: 1px solid #aaa;
    border-radius: 3px;

    display: flex;
    flex-direction: column;
    align-items: center;
    input {
      display: none;
    }
    label,header {
      padding: 0.6rem 0.8rem;
      width: 100%;
      border-bottom: 1px solid #aaa;
      text-align: left;
    }
    label {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      i:first-of-type {
        margin-right: 0.4rem;
        margin-top: -0.2rem;
      }
      i.indicator {
        margin-left: auto;
        font-size: 75%;
      }
      &:hover {
        background: whitesmoke;
      }
    }
    header {
      padding-bottom: 0.3rem;
      font-size: 1rem;
    }
    label:last-of-type {
      border-bottom: none;
    }
  }
 
  form.pfp-form {
    width: 100%;
    text-align: center;
    margin-top: 0.5rem;
    label[for="pfp"] {
      display: block;
      padding: var(--padding-m);
      border-radius: 0.2rem;
      background: var(--background-dark);
      color: white;
      &:hover {
        box-shadow: inset 0 0 0 99em rgba(255,255,255,0.2);
      }
    }
    label[for="pfp"] {
      float: left;
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
</style>
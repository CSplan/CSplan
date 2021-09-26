<script lang="ts">
  let files: FileList
  let display: HTMLImageElement

  // Button/placeholder visibility
  let hasUpload = false

  function onImageLoad(): void {
    const file = files[0]

    const url = URL.createObjectURL(file)
    // Display the profile picture
    hasUpload = true
    display.src = url
  }
</script>

<div class="user-picture">
  {#if !hasUpload}
    <i class="fas fa-user-circle"></i>
  {/if}
  <!-- svelte-ignore a11y-img-redundant-alt -->
  <img class="profile-picture" class:d-none={!hasUpload} alt="User Profile Picture" bind:this={display}>

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

    img.profile-picture {
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
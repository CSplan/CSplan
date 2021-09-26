<script lang="ts">
  import user from '../../stores/user'
  import { tick } from 'svelte'

  let files: FileList
  let display: HTMLImageElement
  let hasImage = false

  async function onImageLoad(): Promise<void> {
    const file = files[0]

    const url = URL.createObjectURL(file)
    // Display the profile picture
    hasImage = true
    await tick()
    display.src = url
  }
</script>

<section class="account-menu">
  <article class="submenu account-card">
    <div class="user-picture">
      {#if hasImage}
        <!-- svelte-ignore a11y-img-redundant-alt -->
        <img class="profile-picture" alt="User Profile Picture" bind:this={display}>
      {:else}
        <i class="fas fa-user-circle"></i>
      {/if}
      <form class="pfp-form" on:submit|preventDefault>
        <label for="pfp">
          <i class="fas fa-upload"></i>
          <span>Upload</span>
        </label>
        <input type="file" id="pfp" accept="image/png, image/jpeg" bind:files={files} on:change={onImageLoad}>

        <input type="submit" value="Save">
      </form>
    </div>
    <form class="user-details" on:submit|preventDefault>

      <label for="email">Email</label>
      <input type="email" name="email" value={$user.user.email} disabled>

      <label for="password">Password</label>
      <input type="password" name="password" placeholder={'*'.repeat(30)} disabled title="CSplan does not support changing passwords yet, but this feature is coming soon.">


    </form>
  </article>
</section>


<style lang="scss">
  @import '../../scss/colors.scss';
  
  .account-menu {
    max-width: 800px;
    height: 100%;
    margin-left: 10%;

    display: flex;
    flex-direction: column;
    padding: 0 2rem;
  }
  .submenu {
    margin: 1.5rem 0;
  }
  .account-card {
    display: grid;
    grid-template-columns: minmax(min-content, 250px) 1fr;
    grid-template-rows: max-content;
    color: #111;
    >* {
      padding: 0.4rem 0.8rem;
      border: 1px solid #aaa;
    }
    .user-picture {
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

    form.user-details {
      display: flex;
      flex-direction: column;
      padding: var(--padding-m);

      input {
        margin: 0.5rem 0;
        border-radius: 0;
      }
    }
  }
</style>
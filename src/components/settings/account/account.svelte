<script lang="ts">
  import user from '$stores/user'
  import ProfilePictureForm from './pfp-form.svelte'
  import Details from '../../templates/_detail-dropdown.svelte'

  const enum NamePrefs {
    FirstName,
    LastName,
    FullName,
    Username
  }
  let namePref = NamePrefs.FirstName

  let editMode = false

  function toggleEditMode(): void {
    editMode = !editMode
    if (!editMode) {

    }
  }
</script>

<section class="account-menu">
  <article class="submenu account-card">

    <ProfilePictureForm/>
    
    <form class="user-details" on:submit|preventDefault>

      <i class="fas fa-edit clickable" on:click={toggleEditMode} class:on={editMode}></i>


      <label for="email">Email</label>
      <input id="email" type="email" value={$user.user.email} disabled>

      <label for="password">Password</label>
      <input id="password" type="password" placeholder={'*'.repeat(30)} disabled title="CSplan does not support changing passwords yet, but this feature is coming soon.">

      <hr>

      <label for="username">Username</label>
      <input id="username" type="text" disabled={!editMode}>

      <label for="firstname">First Name</label>
      <input id="firstname" type="text" disabled>

      <label for="lastname">Last Name</label>
      <input id="lastname" type="text" disabled>

      <Details summary="Name Preference">
        <label>
          <input type="radio" bind:group={namePref} value={NamePrefs.FirstName}>
          First Name
        </label>

        <label>
          <input type="radio" bind:group={namePref} value={NamePrefs.LastName}>
          Last Name
        </label>

        <label>
          <input type="radio" bind:group={namePref} value={NamePrefs.FullName}>
          Full Name
        </label>

        <label>
          <input type="radio" bind:group={namePref} value={NamePrefs.Username}>
          Username
        </label>
      </Details>

      {#if editMode}
        <hr>
        <input type="submit" value="Save">
      {/if}

    </form>
  </article>
</section>


<style lang="scss">
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

    form.user-details {
      display: flex;
      flex-direction: column;
      padding: var(--padding-m);

      input,:global(details) {
        margin: 0.5rem 0;
        border-radius: 0;
      }
      input[type="text"],input[type="password"],input[type="email"] {
        &:disabled,&:read-only {
          transition: none;
          background-color: rgb(230, 230, 230);
        }
      }
      input[type="radio"] {
        position: static;
        display: inline-block;
        opacity: 100%;
        height: 1rem;
        width: 1rem;
      }
      i {
        align-self: flex-end;
        margin-bottom: -1rem;
        z-index: 1;
        &.on {
          color: var(--bold-blue);
        }
      }
      hr {
        width: 100%;
        color: #aaa;
        border-top: 1px;
      }
    }
  }
</style>
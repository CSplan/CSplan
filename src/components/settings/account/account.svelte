<script lang="ts">
  import user from '$stores/user'
  import ProfilePictureForm from './pfp-form.svelte'
  import PasswordForm from './password-form.svelte'
  import Details from '../../templates/_detail-dropdown.svelte'
  import navState, { FormIDs } from '../navigation-state'

  const enum NamePrefs {
    FirstName,
    LastName,
    FullName,
    Username
  }
  let namePref = NamePrefs.FirstName
</script>

<section class="account-menu">
  <article class="submenu account-card">

    <ProfilePictureForm/>
    
    <section class="user-details" on:submit|preventDefault>

      <form>
        <label for="email">Email</label>
        <input id="email" type="email" value={$user.user.email} disabled>
      </form>

      <PasswordForm></PasswordForm>
      <hr>

      <form class="name-form" class:disabled={$navState.isEditing !== null && $navState.isEditing !== FormIDs.ChangeName}>
        <label for="username">Username</label>
        <input id="username" type="text">

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
      </form>
    </section>
  </article>
</section>


<style lang="scss">
  .account-menu :global {
    input,details,label.checkable {
      margin: 0.5rem 0;
      border-radius: 0;
    }
    label.checkable {
      margin-bottom: 1rem;
    }
    input[type="submit"] {
      border-radius: $br-light;
    }

    form.disabled {
      pointer-events: none; 
    }

    input[type="text"],input[type="password"],input[type="email"] {
      &:disabled,&:read-only {
        transition: none;
        background-color: rgb(230, 230, 230);
      }
    }

    div.input-group {
      display: flex;
      flex-direction: row;
      align-items: center;
      i {
        margin-right: 0.5rem;
        margin-left: 1rem;
      }
    }
  }

  .account-menu {
    max-width: 800px;
    height: 100%;
    margin-left: 10%;

    display: flex;
    flex-direction: column;
    padding: 0 2rem;
    line-height: 1;
  }
  .submenu {
    margin: 1.5rem 0;
  }
  .account-card {
    display: grid;
    grid-template-columns: minmax(min-content, 250px) 1fr;
    grid-template-rows: max-content max-content;
    color: #111;
    >input {
      padding: 0.4rem 0.8rem;
    }
    >* {
      border: 1px solid #aaa;
    }

    section.user-details {
      grid-column: 2;
      grid-row: 1 / span 2;
      display: flex;
      flex-direction: column;
      padding: $padding-m;

      input[type="radio"] {
        position: static;
        display: inline-block;
        opacity: 100%;
        height: 1rem;
        width: 1rem;
      }
      hr {
        width: 100%;
        color: #aaa;
        border-top: 1px;
      }
    }
  }
</style>
<script lang="ts">
  import user from '$stores/user'
  import ProfilePictureForm from './pfp-form.svelte'
  import PasswordForm from './password-form.svelte'
  import NameForm from './name-form.svelte'
</script>

<section class="account-menu">
  <article class="submenu account-card">

    <ProfilePictureForm/>
    
    <section class="user-details" on:submit|preventDefault>

      <form>
        <label for="email">Email</label>
        <input id="email" type="email" value={$user.user.email} disabled>
      </form>

      <PasswordForm/>
      <hr>
      <NameForm/>

    </section>
  </article>
</section>


<style lang="scss">
  .account-menu :global {
    @include form-styles;
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
    >* {
      border: 1px solid #aaa;
    }

    section.user-details {
      grid-column: 2;
      grid-row: 1 / span 2;
      display: flex;
      flex-direction: column;
      padding: $padding-m;

      hr {
        width: 100%;
        color: #aaa;
        border-top: 1px;
      }
    }
  }
</style>
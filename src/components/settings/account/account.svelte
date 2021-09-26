<script lang="ts">
  import user from '../../../stores/user'
  import ProfilePictureForm from './pfp-form.svelte'
</script>

<section class="account-menu">
  <article class="submenu account-card">

    <ProfilePictureForm/>
    
    <form class="user-details" on:submit|preventDefault>

      <label for="email">Email</label>
      <input type="email" name="email" value={$user.user.email} disabled>

      <label for="password">Password</label>
      <input type="password" name="password" placeholder={'*'.repeat(30)} disabled title="CSplan does not support changing passwords yet, but this feature is coming soon.">


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

      input {
        margin: 0.5rem 0;
        border-radius: 0;
      }
    }
  }
</style>
<script>
  import user from '../../stores/user'
</script>

<section class="account-menu">
  <article class="submenu account-card">
    <div class="user-picture">
      <i class="fas fa-user-circle"></i>
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
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 2rem;
  }
  .submenu {
    margin: 1.5rem 0;
    min-width: 600px;
  }
  .account-card {
    display: grid;
    grid-template-columns: min-content 1fr;
    grid-template-rows: max-content;
    color: #111;
    >* {
      padding: 0.4rem 0.8rem;
      border: 1px solid #aaa;
    }
    .user-picture {
      line-height: 1;
      font-size: 8.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      grid-column: 1 / span 1;
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
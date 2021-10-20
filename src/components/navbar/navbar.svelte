<script lang="ts">
  import user from '$stores/user'
  import QuickActions from './quick-actions.svelte'
  const links = [
    {
      title: 'Home',
      href: '/'
    },
    {
      title: 'Lists',
      href: '/lists',
      needsLogin: true
    },
    {
      title: 'Tags',
      href: '/tags',
      needsLogin: true
    }
  ]
</script>

<nav>
  <!-- Magic stuff for mobile -->
  <input id="bmenub" type="checkbox" class="show">
  <label for="bmenub" class="burger pseudo button">
    <i class="fas fa-bars"></i>
  </label>
  
  <div class="menu">
  {#if $user.isLoggedIn}
    <span class="account-text-mobile">{$user.user.email}</span>
  {/if}
  {#each links as link}
    {#if link.needsLogin && $user.isLoggedIn}
      <a class="pseudo button" sveltekit:prefetch href={link.href}>{link.title}</a>
    {:else if !link.needsLogin}
      <a class="pseudo button" sveltekit:prefetch href={link.href}>{link.title}</a>
    {/if}
  {/each}
  <div class="right">
    {#if $user.isLoggedIn}
      <span>{$user.user.email}</span>
      <!-- Quick actions dropdown -->
      <QuickActions/>
    {:else}
      <a class="pseudo button login" href="/login">Log In</a>
      <a class="pseudo button register" href="/register">Register</a>
    {/if}
  </div>
  </div>
</nav>

<style lang="scss">
  :root {
    --user-name-margin: 1rem;
  }
  /* Navbar styling */
  nav, .menu {
    padding: 0;
    background: var(--background-dark);
    color: whitesmoke;
  } 
  nav {
    position: relative;
  }
  /* Desktop styles */
  @media screen and (min-width: 850px) {
    .menu {
      display: flex;
      flex-direction: row;
      width: 100%;
      padding: 0 1rem;
    }
    .menu .right {
      margin-left: auto;
      display: flex;
      flex-direction: row;
      align-items: center;
    }
    .account-text-mobile {
      display: none;
    }
    /* Extra right margin for the user's name */
    .menu .right span {
      margin-right: var(--user-name-margin);
    }
  }
  /* Mobile styles */
  @media screen and (max-width: 850px) {
    .menu {
      display: flex;
      flex-direction: column;
      background: #333;
      width: 100%;
      padding: 1rem;

      >a {
        border-radius: 0;
      }
      >a:not(:last-child) {
        border-left: 1px white solid;
      }
    }
    .menu .right {
      width: 100%;
      display: flex;
      flex-direction: column;
      text-align: center; /* Show the user's name/email in the center of the menu without enabling full center alignment */
    }
    /* Extra bottom margin for the user's name */
    .account-text-mobile {
      padding: 0.3rem 0.9rem;
      margin-left: 0;
      margin-right: 0;
      border-bottom: 1px white solid;
    }
    .menu .right span {
      display: none;
    }
  }
  /* Item item spacing */
  a {
    margin: 0 0.3rem;
  }
  .menu > a {
    margin: 0.3rem 0;
  }

  /* Register and login buttons get special colors */
  .register {
    background: var(--bold-blue);
  }
  .login {
    background: var(--light-purple)
  }

</style>

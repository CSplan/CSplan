<script lang="ts">
  // Will be filled in by state management later
  import user from '../stores/user'

  const links = [
    {
      title: 'Home',
      href: '/'
    },
    {
      title: 'Todo Lists',
      href: '/todos'
    },
    {
      title: 'Categories',
      href: '/categories'
    },
    {
      title: 'Shared',
      href: '/shared'
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
  {#each links as link}
    <a class="pseudo button" href={link.href}>{link.title}</a>
  {/each}
  <div class="right">
    {#if $user.isLoggedIn}
      <button class="transparent">
        <i class="fas fa-chevron-down"></i>
      </button>
      <button class="transparent">
        <i class="fas fa-cog"></i>
      </button>
    {:else}
      <a class="pseudo button login" href="/login">Log In</a>
      <a class="pseudo button register" href="/register">Register</a>
    {/if}
  </div>
  </div>
</nav>

<style>
  /* Navbar styling */
  nav {
    padding: 0 0.5rem;
    background: #333;
    color: whitesmoke;
    position: static;
  }
  /* Desktop styles */
  @media screen and (min-width: 960px) {
    .menu {
      display: flex;
      flex-direction: row;
      width: 100%;
    }
    .menu .right {
      margin-left: auto;
    }
  }
  /* Mobile styles */
  @media screen and (max-width: 960px) {
    nav {
      overflow-y: hidden;
    }
    .menu {
      display: flex;
      flex-direction: column;
      background: #333;
      width: 100%;
      padding: 1rem;
    }
    .menu .right {
      width: 100%;
      display: flex;
      flex-direction: column;
    }
  }
  /* Tighter item spacing */
  a {
    margin-right: 0;
  }
  button {
    margin-right: 0;
  }

  /* Register and login buttons get special colors */
  .register {
    background: var(--bold-blue);
  }
  .login {
    background: var(--light-purple)
  }
</style>

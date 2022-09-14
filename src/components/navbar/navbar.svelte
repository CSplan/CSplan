<script lang="ts">
  import QuickActions from './quick-actions.svelte'
  import cookie from 'js-cookie'
  import { afterNavigate, invalidateAll } from '$app/navigation'
  import { onMount } from 'svelte'
  
  export let user: App.Locals['user']
  export let settings: App.Locals['settings']
  $: isLoggedIn = user != null

  async function toggleDarkModeCookie(): Promise<void> {
    // Current value of the setting before being toggled
    const v = cookie.get('DarkMode') === `${true}`
    // Update the value in memory state and set a new cookie
    cookie.set('DarkMode', `${!v}`, {
      sameSite: 'strict'
    })
    await invalidateAll()
  }
  
  // Re-hide navbar after page navigation
  let show: boolean
  afterNavigate(() => {
    show = false
  })

  type Link = {
    title: string
    href: string
    needsLogin?: boolean // True/false if user must/must not be logged in, undefined if always present
  }
  const links: Link[] = [
    {
      title: 'Lists',
      href: '/lists',
      needsLogin: true
    },
    {
      title: 'Tags',
      href: '/tags',
      needsLogin: true
    },
    {
      title: 'About',
      href: '/info',
      needsLogin: false
    }
  ]

  // Hack to prevent navbar from overflowing without disabling scroll anywhere else
  let html: HTMLElement
  onMount(() => {
    html = document.querySelector(':root')!
  })
  $: if (html != null) {
    if (show) {
      html.style.overflowY = 'hidden'
    } else {
      html.style.overflowY = 'initial'
    }
  }
</script>

<nav class:dark={settings.darkMode}>
  <!-- Magic stuff for mobile -->
  <input id="bmenub" type="checkbox" class="show" bind:checked={show}>
  <label for="bmenub" class="burger pseudo button">
    <i class="fas fa-bars"></i>
  </label>
  
  <div class="menu">
  <a href="/" class="logo-container">
    <img src="/logo/Dark-CSplan-noslogan.svg" alt="CSplan logo" class="logo">
  </a>
  {#if user != null}
    <span class="account-text-mobile">{user.email}</span>
  {/if}
  {#each links as link}
    {#if link.needsLogin && isLoggedIn}
      <a class="pseudo button" data-sveltekit-prefetch href={link.href}>{link.title}</a>
    {:else if !link.needsLogin && !isLoggedIn}
      <a class="pseudo button" data-sveltekit-prefetch href={link.href}>{link.title}</a>
    {:else if link.needsLogin == null}
      <a class="pseudo button" data-sveltekit-prefetch href={link.href}>{link.title}</a>
    {/if}
  {/each}

  <div class="right">
    {#if user != null}
      <span>{user.email}</span>
      <!-- Quick actions dropdown -->
      <QuickActions/>
    {:else}
      <i class="darkmode-indicator clickable {settings.darkMode ? 'fas' : 'far'} fa-moon" on:click={() => {
        toggleDarkModeCookie()
      }}></i>
      <a class="pseudo button login" data-sveltekit-prefetch href="/login">Log In</a>
      <a class="pseudo button register" data-sveltekit-prefetch href="/register">Register</a>
    {/if}
  </div>
  </div>
</nav>

<style lang="scss">
  @import './navbar.scss';
  @media (max-width: $mobile-max) {
    nav.dark {
      background: inherit;
    }
  }
  i.darkmode-indicator {
    font-size: 1.3rem;
  }
</style>

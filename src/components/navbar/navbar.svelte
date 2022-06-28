<script lang="ts">
  import user from '$stores/user'
  import QuickActions from './quick-actions.svelte'
  import { afterNavigate } from '$app/navigation'
  import { onMount } from 'svelte'

  // Re-hide navbar after page navigation
  let show: boolean
  afterNavigate(() => {
    show = false
  })

  const links = [
    {
      title: 'About',
      href: '/about'
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

<nav>
  <!-- Magic stuff for mobile -->
  <input id="bmenub" type="checkbox" class="show" bind:checked={show}>
  <label for="bmenub" class="burger pseudo button">
    <i class="fas fa-bars"></i>
  </label>
  
  <div class="menu">
  <a href="/" class="logo-container">
    <img src="/logo/Dark-CSplan-noslogan.svg" alt="CSplan logo" class="logo">
  </a>
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
      <a class="pseudo button login" sveltekit:prefetch href="/login">Log In</a>
      <a class="pseudo button register" sveltekit:prefetch href="/register">Register</a>
    {/if}
  </div>
  </div>
</nav>

<style lang="scss">
  @import '../../scss/colors.scss';
  @import './navbar.scss';
</style>

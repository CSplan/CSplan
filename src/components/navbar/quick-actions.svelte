<script lang="ts">
  import user from '$stores/user'
  import { fly } from 'svelte/transition'
  import { userPFP } from '$stores/user-profile-picture'

  let show = false
  function toggle(): void {
    show = !show
  }
</script>

<svelte:body on:click={() => show = false}/>

<div class="container" on:click|stopPropagation on:mouseenter={() => {
  userPFP.init()
}}>
  <i class="fas fa-chevron-down clickable quick-actions-toggle" on:click={toggle} class:open={show}/>

  {#key show}
    <section class="dropdown" class:desktop-show={show} transition:fly={{ duration: 200, y: -10 }}>
      <div class="buttons">
        <a href="/settings">
          <i class="fas fa-cog"/>
          Settings
        </a>
        <a href="/payment">
          <i class="fad fa-credit-card" style:color="var(--success-green)"/>
          CSplan Pro
        </a>
        <a href="/info" sveltekit:prefetch>
          <i class="fas fa-book"></i>
          Information
        </a>
        <button class="transparent" on:click={() => {
          user.logout()
        }}>
          Log Out
        </button>
      </div>
    </section>
  {/key}
</div>

<style lang="scss">
  div.container {
    position: relative;
  }
  /* Quick actions icon rotates when clicked */
  i.quick-actions-toggle {
    margin-top: 0.25rem;
    transition: transform 0.2s;
    transform: none;

    &.open {
      transform: rotate(-180deg);
    }
  }

  @media all and (max-width: 850px) {
    // TODO: quickactions padding on mobile should be handled without breaking scope rules
    .dropdown {
      padding-top: 0 !important;
      padding-bottom: 0 !important;
    }
    .container>i {
      display: none;
    }
    .buttons>* {
      padding-top: 0.8rem !important;
      padding-bottom: 0.8rem !important;
      margin: 0;
      border-radius: 0;
      border-bottom: 1px white solid;
      &:last-child {
        border-bottom: none;
      }
    }
  }
  button {
    position: relative;
  }
  .dropdown {
    background: $bg-dark;
    padding: 0.8rem;
    border-radius: 0.2rem;
    font-size: 1.1rem;
    box-shadow: 0.5rem 0.3rem 1.25rem $bg-dark;
  }
  @media all and (min-width: 850px) {
    .dropdown:not(.desktop-show) {
      display: none;
    }
    .dropdown {
      min-width: 225px;
      position: absolute;
      top: 3rem;
      right: 0%;
    }
    .buttons>* {
      margin: 0.3rem 0;
      padding: 0.3rem 0.9rem;
      border-radius: 0.3rem;
    }
  }
  .dropdown .buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .buttons>* {
    padding: 0.3rem 0.5rem;
    white-space: nowrap;
    width: 100%;
    color: white;
    text-align: center;
  }
  .buttons>*:not(:last-child) {
    margin-bottom: 0;
  }
  .buttons>*:hover {
    box-shadow: inset 0 0 0 99em rgba(255,255,255,0.2);
  }

  /* Icon animations */
  @keyframes spin {
    from {transform: rotate(0deg);}
    to {transform: rotate(359deg);}
  }
  .buttons>*:hover>i.fa-cog {
    animation-name: spin;
    animation-duration: 3s;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
  }
</style>

<script lang="ts">
  import user from '../../stores/user'
  import { fly } from 'svelte/transition'

  let show = false
  function toggle(): void {
    show = !show
  }
</script>

<svelte:body on:click={() => show = false}/>

<div class="container" on:click|stopPropagation>
  <i class="fas fa-chevron-down clickable quick-actions-toggle" on:click={toggle} class:open={show}/>

  {#if show}
    <section class="dropdown" transition:fly={{ duration: 200, y: -10 }}>
      <div class="buttons">
        <a href="/settings">
          <i class="fas fa-cog"/>
          Settings
        </a>
        <button class="transparent" on:click={user.logout}>
          Log Out
        </button>
      </div>
    </section>
  {/if}
</div>

<style lang="scss">
  div.container {
    position: relative;
  }
  button.transparent {
    padding: 0.3rem 0.5rem;
  }
  /* Quick actions icon rotates when clicked */
  i.quick-actions-toggle {
    margin-left: 1rem;
    transition: transform 0.2s;
    transform: rotate(-180deg);

    &.open {
      transform: none;
    }
  }

  @media screen and (max-width: 850px) {
    button.transparent {
      padding: 0;
      width: 90%;
      margin: 0 auto;
    }
    i {
      display: none;
    }
    .dropdown {
      display: block !important;
      position: static !important;
      top: initial;
      border: 2px red solid;
      border-radius: inherit;
    }
  }
  button {
    position: relative;
  }
  .dropdown {
    background: var(--background-alt);
    padding: 0.8rem;
    position: absolute;
    top: 3rem;
    right: 0%;
    border-radius: 0.2rem;
    font-size: 1.1rem;
    box-shadow: 0.5rem 0.3rem 1.25rem var(--background-dark);
  }
  @media screen and (min-width: 850px) {
    .dropdown {
      min-width: 225px;
    }
  }
  .dropdown .buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .buttons>* {
    padding: 0.3rem 0.9rem;
    margin: 0.3rem 0;
    border-radius: 0.3rem;
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

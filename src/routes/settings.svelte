<script lang="ts">
  import { onMount } from 'svelte'

  type MenuItem = {
    icon: string,
    name: string,
    disabled?: boolean,
    endOfSection?: boolean}

  const items: MenuItem[] = [
    {
      name: 'Account',
      icon: 'fas fa-user',
      endOfSection: true
    },
    {
      name: 'Appearance',
      icon: 'fas fa-palette',
      disabled: true
    },
    {
      name: 'Keyboard',
      icon: 'fas fa-keyboard',
      disabled: true,
      endOfSection: true
    },
    {
      name: 'Keys',
      icon: 'fas fa-key'
    },
    {
      name: 'Sessions',
      icon: 'fas fa-server'
    },
    {
      name: 'Privacy',
      icon: 'fas fa-user-lock',
      endOfSection: true
    },
    {
      name: 'Danger Zone',
      icon: 'fas fa-exclamation'
    }
  ]

  const h: number = 5

  onMount(() => {
    console.log(h)
  })
</script>

<div class="background">
  <div class="side-menu">
    {#each items as item}
      <button class="transparent" disabled={item.disabled || false} title={item.disabled ? 'Coming soon' : ''}>
        <i class={item.icon}/>
        <span>{item.name}</span>
      </button>
      {#if item.endOfSection}
        <hr>
      {/if}
    {/each}
  </div>
</div>

<style lang="scss">
  $dark-bg: #18183b;
  $menu-bg: #262650;

  .background {
    background-color: $dark-bg;
    color: white;
    height: 100vh;
    overflow-y: hidden;
  }
  .side-menu {
    background: $menu-bg;
    margin-left: 2rem;
    margin-top: 1.5rem;
    max-width: 15rem;
    padding: 0.6rem;
    border-radius: 0.5rem;

    display: flex;
    flex-direction: column;
    justify-content: center;

    button {
      $hpad: 2rem;
      text-align: center;
      position: relative;
      padding-left: $hpad;
      padding-right: $hpad;
      
      &:disabled {
        background-color: rgba(100, 100, 100, 0.5);
        cursor: not-allowed;
      }
      i {
        position: absolute;
        left: 0;
        margin: 0 0.5rem;
        margin-top: 0.25rem;
      }
    }
    hr {
      width: 100%;
      opacity: 25%;
    }
  }
</style>

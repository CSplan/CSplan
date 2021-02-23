<script lang="ts">
  // @ts-ignore: Sapper module is dynamically generated at compile time
  import { goto } from '@sapper/app'

  type MenuItem = {
    icon: string,
    name: string,
    disabled?: boolean,
    endOfSection?: boolean,
    onclick?: (evt: MouseEvent) => void}

  const items: MenuItem[] = [
    {
      name: 'Back',
      icon: 'fas fa-chevron-left',
      endOfSection: true,
      onclick() {
        goto('/')
      }
    },
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
</script>

<div class="side-menu">
  {#each items as item}
    <button class="transparent" disabled={item.disabled || false} title={item.disabled ? 'Coming soon' : ''} on:click={item.onclick}>
      <i class={item.icon}/>
      <span>{item.name}</span>
    </button>
    {#if item.endOfSection}
      <hr>
    {/if}
  {/each}
</div>

<style lang="scss">
  @import '../../scss/colors.scss';

  @mixin side-menu-position {
    grid-column: 1 / span 1;
  }

  .side-menu {
    @include side-menu-position();
    width: 15rem;
    padding: 0.6rem;
    background-color: var(--background-dark);
    border: 1px solid #aaa;

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
        background-color: rgba(100, 100, 100, 0.25);
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
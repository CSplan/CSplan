<script lang="ts">
  import MenuGroup from './menu-group.svelte'
  import Account from './account/account.svelte'
  import TwoFactor from './2fa/index.svelte'

  export let menu: unknown = TwoFactor

  function setMenu(component: unknown): void {
    menu = component
  }
</script>

<div class="side-menu">
  <MenuGroup title="Account" icon="fas fa-user" on:click={() => setMenu(Account)}/>
  <MenuGroup title="2FA" icon="fas fa-mobile" on:click={() => setMenu(TwoFactor)}/>
  <MenuGroup title="Keys & Backup" icon="fas fa-key"/>
  <MenuGroup title="Sessions" icon="fas fa-desktop"/>
  <MenuGroup title="Delete Account" icon="fas fa-exclamation-circle" color="var(--danger-red)"/>
</div>

<style lang="scss">
  .side-menu {
    background-color: $bg-dark;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.8rem;
    border-radius: 0.2rem;
    font-size: 1.1rem;
    box-shadow: 0.3rem 0.3rem 1.25rem var(--background-dark);
  }

  // Desktop styles
  @media screen and (min-width: 850px) {
    .side-menu {
      min-width: 225px;
    }
  }
</style>
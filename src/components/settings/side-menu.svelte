<script lang="ts">
  import MenuGroup from './menu-group.svelte'
  import settings from '$stores/settings'
</script>

<div class="side-menu" class:shadow={!$settings.darkMode}>
  <MenuGroup href="/settings/account" title="Account" icon="fas fa-user"/>
  <MenuGroup href="/settings/appearance" title="Appearance" icon="fas fa-palette"/>
  <MenuGroup href="/settings/2fa" title="2FA" icon="fas fa-mobile-screen-button"/>
  <MenuGroup href="/settings/keys" title="Keys & Backup" icon="fas fa-key"/>
  <MenuGroup href="/settings/sessions" title="Sessions" icon="fas fa-desktop"/>
  <MenuGroup href="/settings/delete-account" title="Delete Account" icon="fas fa-exclamation-circle" color="var(--danger-red)"/>
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
    &.shadow {
      box-shadow: 0.3rem 0.3rem 1.25rem $bg-dark;
    }
  }

  // Desktop styles
  @media all and (min-width: $desktop-min) {
    .side-menu {
      min-width: 225px;
    }
  }
</style>
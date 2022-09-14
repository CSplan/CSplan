<script lang="ts">
  import KeysMenu from './keys-menu.svelte'
  export let user: App.Locals['user']
</script>

<section class="settings-menu-container">
  <KeysMenu {user}/>
</section>

<style lang="scss">
  @import '../position.scss';
  section.settings-menu-container {
    @include settings-menu-container;
  }
  section.settings-menu-container :global {
    @include form-styles;
  }
</style>
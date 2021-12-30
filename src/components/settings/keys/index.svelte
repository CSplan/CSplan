<script lang="ts">
  import KeysMenu from './keys-menu.svelte'
</script>

<section class="settings-menu-container">
  <KeysMenu/>
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
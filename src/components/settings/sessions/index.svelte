<script lang="ts">
  import SessionView from './session-view.svelte'
</script>

<section class="settings-menu-container">
  <SessionView/>
</section>

<style lang="scss">
  @import '../position.scss';
  section.settings-menu-container {
    @include settings-menu-container;
    max-width: max-content;
    margin-left: auto;
    margin-right: auto;
  }
  section.settings-menu-container :global {
    @include form-styles;
  }
</style>
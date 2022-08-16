<script lang="ts">
  import SideMenu from '$components/purchase/side-menu.svelte'
</script>

<main class="container">
  <SideMenu/>
</main>

<style lang="scss">
  @import '../../components/settings/layout.scss';

  .container {
    @include settings-grid();
  }
</style>
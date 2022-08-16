<script lang="ts">
  import SideMenu from '$components/settings/side-menu.svelte'
</script>

<main class="container">
  <SideMenu/>
  <div class="current-menu">
    <slot></slot>
  </div>
</main>

<style lang="scss">
  @import '../../scss/colors.scss';
  @import '../../components/settings/layout.scss'; 


  .container {
    @include settings-grid();
    @media (max-width: $mobile-max) {
      overflow-x: hidden;
    }
  }

  .current-menu { 
    @media screen and (max-width: $mobile-max) {
      grid-column: 1;
      grid-row: 2 / span 1;
    }
    @media screen and (min-width: $desktop-min) {
      grid-column: 3 / span 1;
      grid-row: 1 / span 2;
    }
    margin-bottom: auto;
  }
</style>

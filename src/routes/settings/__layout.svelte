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

  $v-gap: 1.5rem;
  $h-gap: 2rem;
  $side-menu-width: 225px;

  @mixin settings-grid {
    display: grid;
    @media screen and (min-width: $desktop-min) {
      grid-template-columns: $side-menu-width 1fr max-content 1fr $side-menu-width;
      grid-template-rows: max-content 1fr 10%;
      grid-auto-flow: column;
      padding: $v-gap $h-gap;
    }
    @media screen and (max-width: $mobile-max) {
      grid-template-rows: repeat(max-content, 2);
      grid-auto-flow: row;
      padding-left: $h-gap;
      padding-right: $h-gap;
    }

    column-gap: $h-gap;
    row-gap: $v-gap;
  }

  .container {
    @include settings-grid();
    @media screen and (min-width: $desktop-min) {
      overflow-y: hidden;
    }
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

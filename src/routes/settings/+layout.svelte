<script lang="ts">
  import SideMenu from '$components/settings/side-menu.svelte'
  import type { LayoutData } from './$types'
  export let data: LayoutData
</script>

<main class="container">
  <SideMenu settings={data.settings}/>
  <div class="current-menu">
    <slot></slot>
  </div>
</main>

<style lang="scss">
  @import '../../scss/colors.scss';
  @import '../../components/settings/layout.scss'; 


  .container {
    @include settings-grid();
  }

  .current-menu { 
    @include current-menu();
  }
</style>

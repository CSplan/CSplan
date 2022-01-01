<script>
  import SideMenu from '$components/settings/side-menu.svelte'
  import Sessions from '$components/settings/sessions/index.svelte'

  let menu = Sessions
</script>

<main class="container">
  <SideMenu bind:menu/>
  <div class="current-menu">
    <svelte:component this={menu}/>
  </div>
</main>

<style lang="scss">
  @import '../scss/colors.scss';

  $v-gap: 1.5rem;
  $h-gap: 2rem;

  @mixin settings-grid {
    display: grid;
    grid-template-columns: max-content auto;
    grid-template-rows: max-content 1fr 10%;
    color: white;

    padding: $v-gap $h-gap;
    column-gap: $h-gap;
    row-gap: $v-gap;
  }

  .container {
    @include settings-grid();
    overflow-y: hidden;
  }

  .current-menu { 
    grid-column: 2 / span 1;
    grid-row: 1 / span 2;
  }
</style>

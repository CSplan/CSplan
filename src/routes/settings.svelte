<script>
  import SideMenu from '../components/settings/sideMenu.svelte'
  import Account from '../components/settings/account.svelte'

  let menuComponent = Account
</script>

<div class="container">
  <SideMenu/>
  <div class="current-menu">
    <svelte:component this={menuComponent}/>
  </div>
</div>

<style lang="scss">
  @import '../scss/colors.scss';

  $v-gap: 1.5rem;
  $h-gap: 2rem;

  @mixin settings-grid {
    display: grid;
    grid-template-columns: max-content 1fr;
    grid-template-rows: max-content 1fr;

    padding: $v-gap $h-gap;
    column-gap: $h-gap;
    row-gap: $v-gap;
  }

  .container {
    @include settings-grid();
    background-color: $dark-bg;
    color: white;
    height: 100vh;
    overflow-y: hidden;
  }

  .current-menu { 
    grid-column: 2 / span 1;
    grid-row: 1 / span 2;
  }
</style>

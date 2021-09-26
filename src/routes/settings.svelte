<script>
  import SideMenu from '../components/settings/side-menu.svelte'
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
    grid-template-columns: max-content auto;
    grid-template-rows: max-content 1fr 10%;
    color: white;

    padding: $v-gap $h-gap;
    column-gap: $h-gap;
    row-gap: $v-gap;
  }

  .container {
    @include settings-grid();
    height: 100vh;
    overflow-y: hidden;
  }

  .current-menu { 
    grid-column: 2 / span 1;
    grid-row: 1 / span 2;
  }
</style>

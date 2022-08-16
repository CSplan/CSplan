<script lang="ts">
  import SideMenu from '$components/purchase/side-menu.svelte'
  import PlanType from '$components/purchase/steps/plan-type.svelte'
</script>

<main class="container">
  <SideMenu/>
  <div class="current-step">
    <PlanType/>
  </div>
</main>

<style lang="scss">
  @import '../../components/settings/layout.scss';

  .container {
    @include settings-grid();
  }
  .current-step {
    @media (min-width: $desktop-min) {
      grid-column: 3;
    }
    @media (max-width: $mobile-max) {
      grid-row: 2;
    }
  }
</style>
<script lang="ts">
  import settings from '$stores/settings'
  import AccountTypes from '$lib/account-types'
  export let user: App.Locals['user']

  let planName: string
  $: switch (user?.accountType) {
  case AccountTypes.Pro:
    planName = 'Pro'
    break
  default:
    planName = 'Free'
    break
  }
</script>

<section class="account-type primary">
  <a href="{user?.accountType === AccountTypes.Pro ? '/payment' : '/payment/plans'}">
  <img src="/logo/plans/{$settings.darkMode ? 'Dark' : 'Light'}-CSplan-{planName}-noslogan.svg" alt="CSplan {planName} Graphic">
  </a>
</section>

<style lang="scss">
  section.account-type {
    $border: 1px solid $border-normal;
    border-bottom: $border;
    border-left: $border;
    padding: $padding-m;
    @media (min-width: $desktop-min) {
      min-width: 300px;
    }
    @media (max-width: $mobile-max) {
      border-right: $border;
    }
    img {
      width: 100%;
    }
    &:hover {
      box-shadow: inset 0 0 0 99em rgba(255,255,255,0.1);
    }
  }
</style>
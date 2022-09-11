<script>
  /* eslint-disable */
  import TitleView from '$components/lists/title-view.svelte'
  import VerificationBanner from '$components/banner/verification-banner.svelte'

  // FIXME: this entire route is pretty bad
</script>

<main class="container">
  <TitleView/>
</main>

<VerificationBanner/>

<style lang="scss">
  @media all and (min-width: $desktop-min) {
    main.container {
      padding-left: 250px;
      padding-right: 250px;
    }
  }
  @media all and (max-width: $mobile-max) {
    main.container {
      max-width: 100%;
    }
  }
</style>

<script>
  /* eslint-disable */
  import TitleView from '$components/lists/title-view.svelte'
  import lists from '$stores/lists'
  import { onMount } from 'svelte'

  // FIXME: this entire route is pretty bad

  async function save() {
  }

</script>

<main class="container">
  <TitleView/>
</main>

<style lang="scss">
  @media screen and (min-width: $desktop-min) {
    main.container {
      padding-left: 250px;
      padding-right: 250px;
    }
  }
  @media screen and (max-width: $mobile-max) {
    main.container {
      max-width: 100%;
    }
  }
  
</style>

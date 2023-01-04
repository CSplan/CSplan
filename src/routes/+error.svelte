<script lang="ts">
  import { page } from '$app/stores'
  $: error = $page.error! // Assert that the error exists, this behavior is found in official SK examples
</script>

<main class="container">
  <h1>Error {$page.status}</h1>
  <pre>{error.message}</pre>
  <a class="pseudo button" data-sveltekit-preload-data href="/">
    <button class="alt">Go Home</button>
  </a>
</main>

<style lang="scss">
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  h1 {
    font-size: 3.5rem;
  }
  pre {
    white-space: normal;
  }
  a {
    color: var(--bold-blue) !important;
  }
</style>

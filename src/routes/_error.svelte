<script>
  import navbar from '../components/navbar.svelte'

  export let error;
  export let status;
</script>

<svelte:component this={navbar}></svelte:component>
<main>
  <h1>{error.message}</h1>
  <h2>Status: {status}</h2>
  <a class="pseudo button" rel="prefetch" href="/">Go Home</a>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  a {
    color: var(--bold-blue) !important;
  }
</style>
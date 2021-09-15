<script lang="ts">
  export let error = new Error('an unknown error has occured')
  export let status: number|undefined
</script>

<main>
  <h1>{error.message}</h1>
  {#if status}
    <h2>Status: {status}</h2>
  {/if}
  <a class="pseudo button" sveltekit:prefetch href="/">Go Home</a>
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

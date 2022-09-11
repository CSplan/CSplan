<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit'
  export const load: Load = ({ error, status }) => {
    return {
      props: {
        status,
        message: error?.message
      }
    }
  }
</script>

<script lang="ts">
  export let message: string
  export let status: number
</script>

<main class="container">
  <h1>Error {status}</h1>
  <pre>{message}</pre>
  <a class="pseudo button" sveltekit:prefetch href="/">
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

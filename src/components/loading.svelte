<script>
  import Spinner from './spinner.svelte'
  export let message = 'Loading...'
</script>

<main class="container vcenter">
  <Spinner vm="4.5rem" size="3rem"/>
  <header class="marginless loading-msg">{message}</header>
</main>

<style>
  .loading-msg {
    margin-left: 1.25rem !important; /* Margin defeats the offset introduced by ellipses */
    font-size: 2rem;
  }
</style>
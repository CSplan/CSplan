<script lang="ts">
  import navbar from '../components/navbar.svelte'
  import LoginForm from '../components/auth/loginForm.svelte'

</script>

<svelte:component this={navbar}></svelte:component>
<main>
  <LoginForm/>
</main>

<style>
  main {
    margin-top: 20vh;
    display: flex;
    flex-direction: row;
    align-items: stretch;
    justify-content: center;
  }
</style>
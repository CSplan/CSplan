<script lang="ts">
  import LoginForm from '$components/auth/login-form.svelte'
  import type { PageData } from './$types'

  export let data: PageData
</script>

<main>
  <LoginForm/>
</main>

<style>
  main {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    justify-content: center;
  }
</style>
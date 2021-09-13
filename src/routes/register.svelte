<script lang="ts">
  import Navbar from '../components/navbar/navbar.svelte'
  import RegisterForm from '../components/auth/register-form.svelte'
</script>

<Navbar/>

<main>
  <RegisterForm/>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>
<script lang="ts">
  import Navbar from '../components/navbar.svelte'
  import RegisterForm from '../components/auth/registerForm.svelte'
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
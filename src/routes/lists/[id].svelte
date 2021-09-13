<script context="module">
  export function load({ page }) {
    return {
      props: {
        id: page.params.id
      }
    }
  }
</script>

<script>
  import TodoList from '../../components/lists/todo-list.svelte'
  import Navbar from '../../components/navbar/navbar.svelte'

  export let id
</script>

<Navbar/>

<a class="back-button" href="/lists" sveltekit:prefetch>
  <i class="fas fa-arrow-left"></i>
</a>

<main class="container">
  <TodoList {id}/>
</main>

<style>
  .back-button i {
    padding: 1.25rem;
  }
  .back-button i:hover {
    transform: scale(1.25);
  }
</style>
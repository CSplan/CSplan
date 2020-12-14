<script context="module">
  export async function preload(page) {
    return {
      id: page.params.id
    }
  }
</script>

<script>
  import TodoList from '../../components/todoList.svelte'
  import Navbar from '../../components/navbar.svelte'

  export let id
</script>

<Navbar/>

<a class="back-button" href="/lists" rel="preload">
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
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

<main class="container">
  <TodoList {id}/>
</main>

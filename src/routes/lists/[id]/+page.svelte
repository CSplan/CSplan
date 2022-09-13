<script>
  throw new Error("@migration task: Add data prop (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292707)");

  import TodoList from '$components/lists/todo-list.svelte'
  import VerificationBanner from '$components/banner/verification-banner.svelte'

  export let id
</script>

<a class="back-button" href="/lists" sveltekit:prefetch>
  <i class="fas fa-arrow-left"></i>
</a>

<main class="container">
  <TodoList {id}/>
</main>

<VerificationBanner/>

<style>
  .back-button i {
    padding: 1.25rem;
  }
  .back-button i:hover {
    transform: scale(1.25);
  }
</style>
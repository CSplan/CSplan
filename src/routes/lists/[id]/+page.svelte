<script lang="ts">
  import type { PageData } from './$types'
  export let data: PageData

  import TodoList from '$components/lists/todo-list.svelte'
  import VerificationBanner from '$components/banner/verification-banner.svelte'
</script>

<a class="back-button" href="/lists" data-sveltekit-prefetch>
  <i class="fas fa-arrow-left"></i>
</a>

<main class="container">
  <TodoList id={data.id} user={data.user} settings={data.settings}/>
</main>

<VerificationBanner user={data.user}/>

<style>
  .back-button i {
    padding: 1.25rem;
    padding-bottom: 0;
  }
  .back-button i:hover {
    transform: scale(1.25);
  }
</style>
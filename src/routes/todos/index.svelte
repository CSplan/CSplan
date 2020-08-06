<script>
  import { goto } from '@sapper/app'
  import { onMount } from 'svelte'

  let lists = []
  onMount(async () => {
    const res = await fetch('http://localhost:3000/todos', {
      method: 'GET',
      headers: {
        'CSRF-Token': localStorage.getItem('CSRF-Token')
      },
      credentials: 'include'
    })
    const body = await res.json()
    if (res.status !== 200) {
      goto('/')
    }
    lists = body
  })
  import navbar from '../../components/navbar.svelte'
</script>

<svelte:component this={navbar}></svelte:component>

<main>
  <div class="card">
  {#if lists.length}
  {#each lists as list}
    <a class="row" href="/todos/{list.id}">
      <i class="fas fa-minus"></i>
      <header>list.title</header>
    </a>
  {/each}
  {:else}
    <div class="row noborder">
      <header>It's empty here...</header>
    </div>
    <div class="row">
      <button class="bold">
        Create a Todo List
      </button>
    </div>
  {/if}
  </div>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .card {
    margin-top: 10vh;
    min-width: 800px;
  }
  .row {
    color: initial;
    text-align: center;
    position: relative;
  }
  .row:hover {
    background: whitesmoke;
  }
  /* Create separators */
  .row:not(:last-child) {
    border-bottom: #ccc 1px solid;
  }
  .row.noborder {
    border-bottom: none;
  }

  /* Position enum icons */
  .row i {
    top: calc(25% + 0.25rem);
    position: absolute;
    left: 0.5rem;
    color: rgb(60, 60, 60);
  }
</style>

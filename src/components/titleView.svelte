<script>
  import { goto } from '@sapper/app'
  import { lists, ordered } from '../stores/lists'

  // Props
  export let editMode = false

  async function newList() {
    // Start with a blank template
    const list = {
      title: '',
      items: []
    }
    await lists.create(list)
      .catch((err) => {
        // TODO: proper error handling 
        alert(err)
      })
  }
</script>

<div class="card">
<pre>{JSON.stringify($lists, null, 2)}</pre>
{#if $ordered.length > 0}
{#each $ordered as list}
  <div class="row {!list.title.length && 'empty'}" on:click={() => !editMode && goto(`/todos/${list.id}`)}>
    <i class="fas fa-minus"></i>
    <header contenteditable={editMode} on:input={(e) => lists.update(list.id, { title: e.target.textContent })}>{list.title}</header>
  </div>
{/each}
{:else}
  <div class="row noborder">
    <header>It's empty here...</header>
  </div>
  <div class="row">
    <button class="bold" on:click={newList}>
      Create a Todo List
    </button>
  </div>
{/if}
</div>

<style>
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
  /* Give the correct pointer effect for a clickable div */
  div:not(.empty) {
    cursor: pointer;
  }
  .row.noborder {
    border-bottom: none;
  }
  .row.empty {
    min-height: 3rem;
  }
  button {
    margin: 1rem 0;
  }

  /* Position enum icons */
  .row i {
    top: calc(25% + 0.25rem);
    position: absolute;
    left: 0.5rem;
    color: rgb(60, 60, 60);
  }
</style>

<script>
  import { onMount } from 'svelte'
  import { goto } from '@sapper/app'
  import { lists, ordered } from '../stores/lists'

  // Props
  export let editMode = false

  // Initialize the list store
  onMount(lists.init)

  async function newList() {
    // Start with a blank template
    const list = {
      title: 'hi',
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
{#if $ordered.length > 0}
{#each $ordered as list}
  <div class="row {!list.title.length && 'empty'}">
    <header contenteditable={editMode} on:input={(e) => lists.update(list.id, { title: e.target.textContent })}>{list.title}</header>
    <div class="icons">
      <i class="fas fa-clipboard-list clickable"></i>
      <i class="fas fa-times clickable" on:click|preventDefault={() => console.log('delete time')}></i>
    </div>
  </div>
{/each}
  <div class="row" on:click={newList}><i class="fas fa-plus"></i></div>
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
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    position: relative;
  }
  .row .icons {
    position: absolute;
    right: 0;
    margin: 0.25rem;
  }
  .row .icons i:hover {
    transform: scale(1.25)
  }
  .row:hover {
    background: whitesmoke;
  }
  /* Create separators */
  .row:not(:last-child) {
    border-bottom: #ccc 1px solid;
  }
  /* Give the correct pointer effect for a clickable item */
  .clickable {
    cursor: pointer;
  }
  .row.noborder {
    border-bottom: none;
  }
  .row.empty {
    min-height: 3rem;
  }
  button, i {
    margin: 0.5rem;
  }
</style>

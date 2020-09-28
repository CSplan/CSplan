<script>
  import { onMount } from 'svelte'
  import { goto } from '@sapper/app'
  import { lists, ordered } from '../stores/lists'

  const dev = process.env.NODE_ENV === 'development'

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

  async function toggleEditable(id) {
    lists.update(id, { editable: !$lists[id].editable })
    if (!$lists[id].editable) {
      await lists.commit(id)
    }
  }

  function ondragstart(evt) {
    // Store the item's id in the data transfer
    evt.dataTransfer.setData("text/plain", evt.target.getAttribute('data-id'))
  }

  function ondragover(evt) {
    evt.preventDefault()
    // Set a blue higlight
    evt.target.style.border = 'var(--bold-blue) 2px solid'
    evt.target.style['border-radius'] = '0.3rem'
  }

  function ondragleave(evt) {
    evt.preventDefault()
    evt.target.style = ''
  }

  async function ondrop(evt) {
    evt.target.style = ''
    const index = parseInt(evt.target.getAttribute('data-index'))
    const id = evt.dataTransfer.getData("text/plain")
    await lists.move(id, index)
  }
</script>

<div class="card">
{#if $ordered.length > 0}
{#each $ordered as list, i}
  <div data-id={list.id} data-index={i} class="row {!list.title.length && 'empty'}" draggable="true" on:dragstart={ondragstart} on:dragover={ondragover} on:dragleave={ondragleave} on:dragexit={ondragleave} on:drop={ondrop}>
    <header data-id={list.id} contenteditable={list.editable} on:input={(e) => lists.update(list.id, { title: e.target.textContent })}>{list.title}</header>
    <div class="icons">
      <i class="fas fa-clipboard-list clickable" on:click={goto(`/todos/${list.id}`)}></i>
      <i class="fas fa-edit clickable {list.editable && 'bold'}" on:click={toggleEditable(list.id)}></i>
      <i class="fas fa-times clickable" on:click={lists.delete(list.id)}></i>
    </div>
  </div>
{/each}
  <div class="row clickable" on:click={newList}><i class="fas fa-plus"></i></div>
  {#if false}
  <pre>{JSON.stringify($lists, null, 2)}</pre>
  {/if}
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
  .row .icons-left {
    position: absolute;
    left: 0;
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

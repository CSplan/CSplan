<script>
  import { onMount } from 'svelte'
  import { goto } from '@sapper/app'
  import { lists, ordered } from '../stores/lists'
  import spinner from './spinner.svelte'

  const dev = process.env.NODE_ENV === 'development'

  // Initialize the list store
  let initPromise
  onMount(() => initPromise = lists.init())

  function toggleModal() {
    const el = document.querySelector('#createListModal')
    el.checked = !el.checked
    // Handle escape key presses to exit modal
    if (el.checked) {
      document.addEventListener('keydown', modalKeydown)
    } else {
      document.removeEventListener('keydown', modalKeydown)
    }
  }

  function modalKeydown(evt) {
    if (evt.key === 'Escape') {
      toggleModal()
    }
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

  // Data skeleton for new list
  let listSkeleton = {
    title: '',
    items: []
  }
  function newListItem() {
    listSkeleton.items.push({
      title: '',
      description: '',
      category: ''
    })
    listSkeleton = listSkeleton // Trigger reactivity render
    // Try to focus element every 50ms (we don't have an event fired when it is rendered, so this is the most precision available)
    function timeoutFocus() {
      setTimeout(() => {
        const el = document.querySelector(`[data-item="${listSkeleton.items.length - 1}"]`)
        el ? el.focus() : timeoutFocus()
      }, 50)
    }
    timeoutFocus()
  }

  async function createList() {
    await lists.create(listSkeleton)
      listSkeleton = {
      title: '',
      items: []
    }
    toggleModal()
  }
</script>

<!-- Modal to create a new list-->
<div class="modal">
  <input id="createListModal" type="checkbox">
  <label for="createListModal" class="overlay" on:click|preventDefault>
    <i class="fas fa-times clickable" on:click={toggleModal}></i>
  </label>
  <form class="card">
    <input type="text" placeholder="Title" bind:value={listSkeleton.title}>
    <header>Items
      <i class="fas fa-plus clickable ml-05" on:click={newListItem}></i>
    </header>
    <div class="column">
      {#each listSkeleton.items as _, i}
      <div class="column left-border">
        <input data-item={i} type="text" placeholder="Item Title" bind:value={listSkeleton.items[i].title}>
        <textarea placeholder="Item Description" bind:value={listSkeleton.items[i].description}></textarea>
      </div>
      {/each}
    </div>
    <input type="submit" value="Create" on:click|preventDefault={createList}>
  </form>
</div>

<div class="card">
{#await initPromise}
  <div class="row">
    <div class="column">
      <header>Loading Content...</header>
      <svelte:component this={spinner} size="3rem"></svelte:component>
    </div>
  </div>
{:then}
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
    <div class="row clickable" on:click={toggleModal}><i class="fas fa-plus"></i></div>
  {:else}
    <div class="row noborder">
      <header>It's empty here...</header>
    </div>
    <div class="row">
      <button class="bold" on:click={toggleModal}>
        Create a Todo List
      </button>
    </div>
  {/if}
{:catch err}
  <pre>Error: {err}</pre>
{/await}
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

  /* Column styles */
  .column {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .column * {
    margin: 0.5rem 0;
  }
  /* Use left borders to group items in modal */
  .column.left-border {
    margin-top: 0;
    border-left: 2px #222 solid;
    padding-left: 0.5rem;
  }

  /* Modal overlay styling */
  label[for="createListModal"].overlay {
    cursor: default;
    background: rgba(0.2, 0.2, 0.2, 0.75);
  }
  label[for="createListModal"].overlay i.fa-times {
    position: absolute;
    top: 2rem;
    left: 2rem;
    color: white;
  }
  div.modal .card {
    padding: 1rem;
  }

  div.modal .card :not(:last-child) {
    margin: 0.75rem 0;
  }
  div.modal .card :last-child {
    margin: 0;
  }
  div.modal .card input[type="submit"] {
    width: 100%;
  }
  i.ml-05 {
    margin-left: 0.5rem;
  }
</style>

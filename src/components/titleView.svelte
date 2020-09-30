<script>
  import { onMount } from 'svelte'
  import { flip } from 'svelte/animate'
  import { goto } from '@sapper/app'
  import { lists, ordered } from '../stores/lists'
  import { contenteditableKeypress } from '../misc/contenteditable'
  import Modal, { toggleModal } from './createListModal.svelte'
  import Spinner from './spinner.svelte'

  // State pulled from child components
  let isLoading = false

  // Initialize the list store
  let initPromise
  onMount(() => initPromise = lists.init())

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

<Modal on:loadingChange={(e) => isLoading = e.detail.isLoading}/>

<div class="card">
{#await initPromise}
  <div class="row">
    <div class="column">
      <header>Loading Content...</header>
      <Spinner size="3rem" vm="0.5rem"/>
    </div>
  </div>
{:then}
  {#if $ordered.length > 0}
  {#each $ordered as list, i (list.id)}
    <div animate:flip={{ duration: 200 }} data-id={list.id} data-index={i} class="row {!list.title.length && 'empty'}" draggable="true" on:dragstart={ondragstart} on:dragover={ondragover} on:dragleave={ondragleave} on:dragexit={ondragleave} on:drop={ondrop} >
      <header data-id={list.id} contenteditable on:keypress={contenteditableKeypress} on:blur={() => lists.commit(list.id)} on:input={(e) => lists.update(list.id, { title: e.target.textContent })}>{list.title}</header>
      <div class="icons">
        <i class="fas fa-clipboard-list clickable" on:click={goto(`/todos/${list.id}`)}></i>
        <i class="fas fa-times clickable" on:click={lists.delete(list.id)}></i>
      </div>
    </div>
  {/each}
    {#if isLoading}
      <div class="row"><Spinner size="1.5rem" vm="0.5rem"/></div>
    {:else}
      <div class="row clickable" on:click={toggleModal}><i class="fas fa-plus"></i></div>
    {/if}
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

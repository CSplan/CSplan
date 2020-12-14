<script>
  import { onMount } from 'svelte'
  import { flip } from 'svelte/animate'
  import { lists as store, ordered } from '../stores/lists'
  import { contenteditableKeypress } from '../misc/contenteditable'
  import Modal, { toggleModal } from './createListModal.svelte'
  import Spinner from './spinner.svelte'

  // State pulled from child components
  let isLoading = false

  // Drag and drop code
  function ondragstart(evt) {
    // Store the item's id in the data transfer
    evt.dataTransfer.setData('text/plain', evt.target.getAttribute('data-id'))
  }

  function ondragover(evt) {
    evt.preventDefault()
    // Set a blue higlight
    evt.target.parentNode.style.border = 'var(--bold-blue) 2px solid'
    evt.target.parentNode.style['border-radius'] = '0.3rem'
  }

  function ondragleave(evt) {
    evt.preventDefault()
    evt.target.parentNode.style = ''
  }

  async function ondrop(evt) {
    evt.preventDefault()
    evt.target.parentNode.style = ''
    const index = parseInt(evt.target.getAttribute('data-index'))
    const id = evt.dataTransfer.getData('text/plain')
    await store.move(id, index)
    await store.commit(id)
  }

  // Initialize the list store
  let initPromise
  onMount(() => {
    initPromise = store.init()
  })
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
    <div animate:flip={{ duration: 200 }} class="row {!list.title.length && 'empty'}" data-index={i} data-id={list.id}>
      <div class="handle" data-index={i} data-id={list.id} draggable="true" on:dragstart={ondragstart} on:dragover={ondragover} on:dragleave={ondragleave} on:dragexit={ondragleave} on:drop={ondrop}/>
    
      <header contenteditable on:keypress={contenteditableKeypress} spellcheck="false" on:drop|preventDefault on:blur={e => store.update(list.id, { title: e.target.textContent })}>{list.title}</header>

      <div class="row-end">
      <div class="handle" data-index={i} data-id={list.id} draggable="true"
      on:dragstart={ondragstart}
      on:dragover={ondragover}
      on:dragleave={ondragleave}
      on:dragexit={ondragleave}
      on:drop={ondrop}/>
    
      <div class="icons">
        <a href="/lists/{list.id}" rel="preload">
          <i class="fas fa-clipboard-list clickable"/>
        </a>
        <i class="fas fa-times clickable" on:click={store.delete(list.id)}></i>
      </div>
    </div>
  </div>
  {/each}
    {#if isLoading}
      <div class="row"><Spinner size="1.5rem" vm="0.5rem"/></div>
    {:else}
      <div class="row-bottom clickable" on:click={toggleModal}><i class="fas fa-plus"></i></div>
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
    max-width: 80%;
  }
  .row {
    --side-margin: 5rem;
    color: initial;
    text-align: center;
    display: grid;
    grid-template-columns: minmax(5rem, 1fr) minmax(0, auto) minmax(5rem, 1fr);
    grid-auto-flow: column;
    width: 100%;
  }
  .row-end {
    width: 100%;
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: 1fr max-content;
  }
  .row header {
    word-break: break-all;
    max-width: 100%;
  }
  .row-bottom {
    text-align: center;
    padding: 0.3rem;
  }
  .row .icons {
    width: 100%;
  }
  .row .icons i:hover {
    transform: scale(1.25)
  }
  .icons>i, .icons>a {
    margin: 0.5rem;
  }
  .row:hover, .row-bottom:hover {
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
  button {
    margin: 0.5rem;
  }
</style>

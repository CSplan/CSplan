<script>
  // @ts-nocheck
  // Not written in TS
  import { onMount, tick } from 'svelte'
  import { flip } from 'svelte/animate'
  import { lists as store, ordered } from '../../stores/lists'
  import { CEkeypress } from '../../misc/contenteditable'
  import Modal, { toggleModal } from '../create-list-modal.svelte'
  import Spinner from '../spinner.svelte'

  // Map of list ID -> row element used for quick highlighting
  const rowEls = {}

  // State pulled from child components
  let isLoading = false

  // Update event handlers
  async function onblur(evt, id) {
    store.update(id, { title: evt.target.textContent })
    await store.commit(id)
  }

  // Drag and drop event handlers
  function ondragstart(evt, id) {
    // Store the item's id in the data transfer
    evt.dataTransfer.setData('text/plain', id)
  }

  function ondragover(evt, id) {
    evt.preventDefault()
    // Set a blue higlight
    getRow(id).classList.add('highlighted')
  }

  function ondragleave(evt, id) {
    evt.preventDefault()
    getRow(id).classList.remove('highlighted')
  }

  async function ondrop(evt, index, id) {
    evt.preventDefault()
    const origin = evt.dataTransfer.getData('text/plain')
    await store.move(origin, index)
    await store.commit(origin)
    getRow(id).classList.remove('highlighted')
  }

  // Return the first parent element of evt.target to contain the attribute [data-role="row"]
  // Used to highlight the correct element in drag and drop events
  /**
   * 
   * @param {string} id
   * @returns {HTMLElement}
   */
  function getRow(id) {
    return rowEls[id]
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
    <div animate:flip={{ duration: 200 }} class="row list-{list.id} {!list.title.length && 'empty'}" bind:this={rowEls[list.id]}
      on:drop|capture={e => ondrop(e, i, list.id)}
      on:dragover={e => ondragover(e, list.id)}
      on:dragleave={e => ondragleave(e, list.id)}
      on:dragexit={e => ondragleave(e, list.id)}>

      <a href="/lists/{list.id}" draggable="false"><div></div></a>
    
      <header contenteditable on:keypress={CEkeypress} spellcheck="false" draggable="false" on:blur={e => onblur(e, list.id)}>{list.title}</header>

      <!-- Group the clickable white space to the right of the list title and the drag/delete buttons to the side for alignment purposes -->
      <div class="row-end">

        <a href="/lists/{list.id}" draggable="false"><div></div></a>

        <div class="icons">
          <i class="fas fa-grip-vertical clickable" draggable="true" on:dragstart={e => ondragstart(e, list.id)} title="This item is draggable."></i>
          <i class="fas fa-times clickable" on:click={store.delete(list.id)}></i>
        </div>
      </div>
    </div>
  {/each}
    {#if isLoading}
      <div class="row"><Spinner size="1.5rem" vm="0.5rem"/></div>
    {:else}
      <div class="row-center clickable" on:click={toggleModal}><i class="fas fa-plus"></i></div>
    {/if}
  {:else}
    <div class="row-center noborder">
      <header>It's empty here...</header>
    </div>
    <div class="row-center">
      <button class="bold" on:click={toggleModal}>
        Create a Todo List
      </button>
    </div>
  {/if}
{:catch err}
  <pre>{err instanceof Error ? err : `Error: ${err}`}</pre>
{/await}
</div>

<style lang="scss">
  .card {
    margin-top: 10vh;
    min-width: 50%;
    max-width: 80%;
    pre {
      margin: 0;
      text-align: center;
      color: red;
    }
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
  .row.highlighted {
    border-left: var(--bold-blue) 2px solid;
    border-right: var(--bold-blue) 2px solid;
  }
  .row header {
    word-break: break-all;
    max-width: 100%;
  }
  .row-center {
    text-align: center;
  }
  .icons {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .row .icons i:hover {
    transform: scale(1.25)
  }
  .icons>i, .icons>a {
    margin: 0.5rem;
  }
  .row:hover, .row-center:hover {
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

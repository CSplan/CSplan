<script>
  /* eslint-disable */
  // Not written in TS
  import { onMount, tick } from 'svelte'
  import { flip } from 'svelte/animate'
  import { lists as store, ordered } from '$stores/lists'
  import { CEkeypress } from '../../misc/contenteditable'
  import Modal from '../modals/create-list-modal.svelte'
  import Spinner from '../spinner.svelte'

  let showModal = false

  // Map of list ID -> if the list's row should be highlighted
  const highlightRow = {}

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

  function ondragover(id) {
    // Set a blue higlight
    highlightRow[id] = true
  }

  function ondragleave(id) {
    // Remove row highlight
    highlightRow[id] = false
  }

  async function ondrop(evt, index, id) {
    const origin = evt.dataTransfer.getData('text/plain')
    await moveItem(origin, index)
    highlightRow[id] = false
  }

  // Move the list identified by id to index
  async function moveItem(id, index) {
    await store.move(id, index)
    await store.commit(id)
  }

  function completedItems(items) {
    return items.reduce((count, item) => item.done ? ++count : count, 0)
  }

  // Initialize the list store
  let initPromise
  onMount(() => {
    initPromise = store.init()
  })
</script>

<Modal bind:show={showModal}/>

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
    <div animate:flip={{ duration: 200 }} class="row list-{list.id} {!list.title.length && 'empty'}"
      class:highlighted={highlightRow[list.id]}
      on:dragover|preventDefault={_ => ondragover(list.id)}
      on:dragleave|preventDefault={_ => ondragleave(list.id)}
      on:dragexit|preventDefault={_ => ondragleave(list.id)}
      on:drop|capture|preventDefault={e => ondrop(e, i, list.id)}>

      <div class="row-start">
        <div class="item-count-container">
          <p class="item-count">{completedItems(list.items)}/{list.items.length}</p>
      </div>

        <a href="/lists/{list.id}" sveltekit:prefetch draggable="false" class="list-link"><div></div></a> <!-- draggable="false" is needed to override default the default html assumption that links can be dragged,
          inside div supresses compiler warning that <a> elements must contain children -->
        
      </div>
    
      <div class="header-container">
        <header contenteditable on:keypress={CEkeypress} spellcheck="false" draggable="false" on:blur={e => onblur(e, list.id)}>{list.title}</header>
      </div>

      <!-- Group the clickable white space to the right of the list title and the drag/delete buttons to the side for alignment purposes -->
      <div class="row-end">

        <a href="/lists/{list.id}" sveltekit:prefetch draggable="false" class="list-link"><div></div></a>

        <div class="icons">
          <!-- Up-down arrows for moving list position -->
          {#if $ordered.length > 1}
          <div class="arrow-icons">
            {#if i > 0}
              <i class="fas fa-arrow-up clickable no-transform" title="Move item up" on:click={moveItem(list.id, i-1)}></i>
            {/if}
            {#if i + 1 < $ordered.length}
              <i class="fas fa-arrow-down clickable no-transform" title="Move item down" on:click={moveItem(list.id, i+1)}></i>
            {/if}
          </div>
          {/if}

          <!-- Drag and drop handle for moving list position-->
          <i class="fas fa-grip-vertical clickable" draggable="true" on:dragstart={e => ondragstart(e, list.id)} title="This item is draggable."></i>

          <!-- Delete button for the list -->
          <i class="fas fa-times clickable" on:click={store.delete(list.id)}></i>
        </div>
      </div>
    </div>
  {/each}
    {#if isLoading}
      <div class="row"><Spinner size="1.5rem" vm="0.5rem"/></div>
    {:else}
      <div class="row-center clickable" on:click={() => {
        showModal = true
      }}><i class="fas fa-plus"></i></div>
    {/if}
  {:else}
    <div class="row-center noborder">
      <header>It's empty here...</header>
    </div>
    <div class="row-center">
      <button class="bold" on:click={() => {
        showModal = true
      }}>
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
    margin-top: 25px;
    @media screen and (min-width: $desktop-min) {
      min-width: 75%;
      max-width: 100%;
    }
    @media screen and (max-width: $mobile-max) {
      width: 100%;
    }
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
    @media screen and (max-width: $mobile-max) {
      grid-template-columns: minmax(2rem, 1fr) minmax(0, auto) minmax(2rem, 1fr);
    }
    @media screen and (min-width: $desktop-min) {
      grid-template-columns: minmax(5rem, 1fr) minmax(0, auto) minmax(5rem, 1fr);
    }
    grid-auto-flow: column;
    width: 100%;
  }

  // Row sections
  .row-start {
    width: 100%;
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: max-content 1fr;
  }
  a.list-link {
    @media screen and (max-width: $mobile-max) {
      display: none;
    }
  }
  .row-end {
    width: 100%;
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: 1fr max-content;
  }
  .item-count-container {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  p.item-count {
    margin: 0.5rem 0.8rem;
  }

  .row.highlighted {
    border-left: var(--bold-blue) 2px solid;
    border-right: var(--bold-blue) 2px solid;
  }
  .row .header-container {
    border-bottom: 1px #aaa solid;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .row header {
    word-break: break-word;
    max-width: 100%;
  }
  .row-center {
    text-align: center;
    button,i {
      margin: 0.8rem;
    }
  }
  .icons {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: end;
  }
  .icons i:not(.no-transform):hover {
    transform: scale(1.25)
  }
  .icons i {
    margin: 0.5rem 0.8rem;
  }
  @media screen and (max-width: $mobile-max) {
    .arrow-icons {
      display: flex;
      flex-direction: column;
      align-items: center;
      i {
        margin: 0.5rem 0;
      }
    }

    i.fa-grip-vertical {
      display: none;
    }
  }
  @media screen and (min-width: $desktop-min) {
    .arrow-icons i:not(:last-child) {
      margin-right: 0.3rem;
    }
    .arrow-icons i:last-child {
      margin-left: 0.3rem;
    }
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
</style>

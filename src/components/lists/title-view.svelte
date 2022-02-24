<script lang="ts">
  // Not written in TS
  import { onMount } from 'svelte'
  import { flip } from 'svelte/animate'
  import { lists as store, ordered } from '$stores/lists'
  import { CEkeypress } from '../../misc/contenteditable'
  import Spinner from '../spinner.svelte'
  import CreateListForm from './create-list-form.svelte'
  import DeleteConfirmationModal from '$components/modals/confirm-modal.svelte'

  let showDeleteConfirmationModal = false

  // Map of list ID -> if the list's row should be highlighted
  const highlightRow: { [id: string]: boolean } = {}

  // State pulled from child components
  let isLoading = false

  // Update event handlers
  async function onblur(evt: SafeEvent, id: string): Promise<void> {
    store.update(id, { title: evt.currentTarget.textContent || '' })
    await store.commit(id)
  }

  // Drag and drop event handlers
  function ondragstart(evt: DragEvent, id: string): void {
    // Store the item's id in the data transfer
    evt.dataTransfer!.setData('text/plain', id)
  }

  function ondragover(id: string): void {
    // Set a blue higlight
    highlightRow[id] = true
  }

  function ondragleave(id: string): void {
    // Remove row highlight
    highlightRow[id] = false
  }

  async function ondrop(evt: DragEvent, index: number, id: string): Promise<void> {
    const origin = evt.dataTransfer!.getData('text/plain')
    await moveItem(origin, index)
    highlightRow[id] = false
  }

  // Move the list identified by id to index
  async function moveItem(id: string, index: number): Promise<void> {
    await store.move(id, index)
    await store.commit(id)
  }

  function completedItems(items: ListItem[]): number {
    return items.reduce((count, item) => item.done ? ++count : count, 0)
  }

  // Initialize the list store
  let initPromise: Promise<void>
  onMount(() => {
    initPromise = store.init()
    isMobile = window.outerWidth <= 849
  })

  // Delete confirmation
  let deletePendingID = ''
  let deleteMessage = ''
  $: deleteMessage = `Are you sure you want to delete '${$store[deletePendingID]?.title}'?`

  async function deleteList(id: string): Promise<void> {
    // Delete any lists with no items without prompting for confirmation
    if ($store[id].items.length === 0) {
      await store.delete(id)
      return
    }

    // Store the ID of the list pending deletion, and prompt the user for final confirmation
    deletePendingID = id
    showDeleteConfirmationModal = true
  }

  async function onDelete(): Promise<void> {
    await store.delete(deletePendingID)
    deletePendingID = ''
  }

  function onDeleteCancel(): void {
    deletePendingID = ''
  }

  // #region Mobile mode-based interface

  let isMobile = false
  // #endregion
</script>

<DeleteConfirmationModal bind:show={showDeleteConfirmationModal} message={deleteMessage} on:cancel={onDeleteCancel} on:submit={onDelete}/>

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
      on:dragover|preventDefault={() => ondragover(list.id)}
      on:dragleave|preventDefault={() => ondragleave(list.id)}
      on:dragexit|preventDefault={() => ondragleave(list.id)}
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
              <i class="fas fa-arrow-up clickable no-transform" title="Move item up"
              on:click={() => moveItem(list.id, i-1)}>
            </i>
            {/if}
            {#if i + 1 < $ordered.length}
              <i class="fas fa-arrow-down clickable no-transform" title="Move item down"
              on:click={() => moveItem(list.id, i+1)}>
            </i>
            {/if}
          </div>
          {/if}

          <!-- Drag and drop handle for moving list position-->
          <i class="fas fa-grip-vertical clickable" draggable="true" on:dragstart={e => ondragstart(e, list.id)} title="This item is draggable."></i>

          {#if list.flags?.saveState != null}
            <div class="spinner">
              <!-- Saving spinner, 1.2em vs 1.1em size on other icons makes spinner attract attention -->
              <Spinner size="1.2em" state={list.flags.saveState}/>
            </div>
          {:else}
            <!-- Delete button for the list -->
            <i class="fas fa-times clickable" on:click={() => deleteList(list.id)}></i>
          {/if}
        </div>

        <div class="icons-mobile">
          <button class="transparent">
            <i class="fas fa-ellipsis-vertical"></i>
          </button>
        </div>
      </div>
    </div>
  {/each}
    {#if isLoading}
      <div class="row"><Spinner size="1.5rem" vm="0.5rem"/></div>
    {/if}
  {:else}
    <div class="row-center border">
      <header>It's empty here...</header>
    </div>
  {/if}
  <CreateListForm>
    <svelte:fragment slot="icon">
      {#if $ordered.length === 0}
        <button class="bold">Create List</button>
      {:else}
        <i class="fas fa-plus"></i>
      {/if}
    </svelte:fragment>
  </CreateListForm>
{:catch err}
  <pre>{err instanceof Error ? err : `Error: ${err}`}</pre>
{/await}
</div>

<style lang="scss">
  @import './icons.scss';

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
      grid-template-columns: minmax(min-content, 1fr) minmax(0, auto) 1fr;
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
    border-right: 1px solid #ccc;
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
  @include titleview-icons;
  .icons i:not(.no-transform):hover {
    transform: scale(1.25)
  }
  @media screen and (max-width: $mobile-max) {
    .icons {
      display: none;
    }
    .icons-mobile {
      display: flex;
      flex-direction: row;
      justify-content: end;
      align-items: center;
      button {
        padding: 0 1rem;
        margin: 0;
        height: 100%;
        color: #111;
      }
    }
  }
  @media screen and (min-width: $desktop-min) {
    .icons-mobile {
      display: none;
    }
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
  .row:not(:last-child),.row-center.border {
    border-bottom: #ccc 1px solid;
  }
  .row.empty {
    min-height: 3rem;
  }
</style>

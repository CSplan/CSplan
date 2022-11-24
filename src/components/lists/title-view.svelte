<script lang="ts">
  import { onMount, tick } from 'svelte'
  import { flip } from 'svelte/animate'
  import { lists as store, ordered } from '$stores/lists/lists'
  import meta from '$stores/lists/titleview-meta'
  import type { ListItem } from '$stores/lists/lists'
  import { CEkeypress } from '../../lib/contenteditable-deprecated'
  import Spinner from '../spinner.svelte'
  import CreateListForm from './create-list-form.svelte'
  import DeleteConfirmationModal from '$components/modals/confirm-modal.svelte'
  import { html2txt } from '$lib/contenteditable/html'
  import { saveSetting } from '$lib/settings'
  // Only used on mobile
  import EditMenu from './list-edit-dropdown.svelte'
  import { Keys } from '$db/storage'
  export let settings: App.Locals['settings']

  let showDeleteConfirmationModal = false

  // Map of list ID -> if the list's row should be highlighted
  const highlightRow: { [id: string]: boolean } = {}

  // State pulled from child components

  // Update event handlers
  async function onblur(id: string): Promise<void> {
    delete showEditableHeader[id]
    store.update((store) => {
      store[id].title = html2txt(titleHTML[id])
      return store
    })
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
    highlightRow[id] = false
    const dt = evt.dataTransfer!
    const origin = dt.getData('text/plain')
    await move(origin, index)
  }

  // Move the list identified by id to index
  async function move(id: string, index: number): Promise<void> {
    await store.move(id, index)
  }

  function completedItems(items: ListItem[]): number {
    return items.reduce((count, item) => item.done ? ++count : count, 0)
  }

  // Initialize the list store
  let initPromise: Promise<void>
  onMount(() => {
    // If the user has previously selected to show archived lists, fetch all instead of only unarchived lists
    if (localStorage.getItem(Keys.ShowArchivedLists) === 'true') {
      meta.update((store) => {
        store.showArchived = true
        return store
      })
      initPromise = store.init('all')
    } else {
      initPromise = store.init()
    }
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

  // #region Contenteditable elements

  // Map of id -> title innerHTML value, used with svelte CE bindings
  const titleHTML: Record<string, string> = {}

  // #endregion

  // #region Mobile mode-based interface

  let showEditMenu: { [id: string]: boolean } = {}

  let showEditableHeader: { [id: string]: boolean } = {}

  let headerElements: { [id: string]: HTMLElement } = {}

  async function editTitle(id: string): Promise<void> {
    showEditableHeader[id] = true
    await tick() // Wait for the editable header to render
    // Move the cursor to the end of the header element
    const range = document.createRange()
    range.selectNodeContents(headerElements[id])
    range.collapse(false)
    // Focus the range
    const selection = getSelection()
    if (selection === null) {
      throw new Error('Error grabbing document selection')
    }
    selection.removeAllRanges()
    selection.addRange(range)
  }
  
  // #endregion
</script>

<DeleteConfirmationModal bind:show={showDeleteConfirmationModal} message={deleteMessage} on:cancel={onDeleteCancel} on:submit={onDelete}/>

<div class="card">
{#await initPromise}
  <div class="row no-grid">
    <div class="column">
      <header>Loading Content...</header>
      <Spinner size="3rem" vm="0.5rem"/>
    </div>
  </div>
{:then}
  <!-- Top panel, contains display, filter, and search options -->
  <div class="row no-grid settings-panel">
    <button class="transparent"
    class:enabled={settings.reverseLists}
    title="Reverse List Order"
    on:click={() => {
      meta.update((store) => {
        store.reverseLists = !$meta.reverseLists
        return store
      })
      saveSetting('reverseLists', !settings.reverseLists)
    }}>
      <i class="fad {settings.reverseLists ? 'fa-arrow-up-wide-short' : 'fa-arrow-down-short-wide'}"></i>
    </button> 

    <button class="transparent"
    class:enabled={$meta.showArchived}
    title="{$meta.showArchived ? 'Hide' : 'Show'} Archived Lists"
    on:click={async () => {
      await meta.setShowArchived(!$meta.showArchived)
    }}>
      <i class="far fa-box-archive"></i>
    </button>
  </div>
  {#if settings.reverseLists}
    <CreateListForm {settings}>
      <svelte:fragment slot="icon">
        {#if $ordered.length === 0}
          <button class="bold">Create List</button>
        {:else}
          <i class="fas fa-plus"></i>
        {/if}
      </svelte:fragment>
    </CreateListForm>
  {/if}
  {#if $ordered.length > 0}
  {#each $ordered as list (list.id)}
  {@const i = list.meta.index}
    <div animate:flip={{ duration: 200 }} class="row list-{list.id} {!list.title.length && 'empty'}"
      class:highlighted={highlightRow[list.id]}
      on:dragover|preventDefault={() => ondragover(list.id)}
      on:dragleave|preventDefault={() => ondragleave(list.id)}
      on:drop|capture|preventDefault={e => ondrop(e, i, list.id)}>

      <div class="row-start">
        <div class="item-count-container">
          <p class="item-count">{completedItems(list.items)}/{list.items.length}</p>
        </div>

        <a href="/lists/{list.id}" data-sveltekit-prefetch draggable="false" class="list-link"><div></div></a> <!-- draggable="false" is needed to override default the default html assumption that links can be dragged,
          inside div supresses compiler warning that <a> elements must contain children -->
        
      </div>
    
      <!-- Desktop - title header is editable -->
      <div class="header-container header-container-desktop" class:editing-header-container={showEditableHeader[list.id]}>
        <header
          contenteditable on:keypress={CEkeypress}
          spellcheck="false" draggable="false"
          bind:this={headerElements[list.id]}
          bind:innerHTML={titleHTML[list.id]}
          on:blur={() => onblur(list.id)}
        >
          {list.title}
        </header>
      </div>

      <!-- Mobile - title header links to list page, title is editable through elipse menu -->
      <a href="/lists/{list.id}" class="header-container header-container-mobile" class:d-none={showEditableHeader[list.id]}>
        <header draggable="false">{list.title}</header>
      </a>
      

      <!-- Group the clickable white space to the right of the list title and the drag/delete buttons to the side for alignment purposes -->
      <div class="row-end">

        <a href="/lists/{list.id}" data-sveltekit-prefetch draggable="false" class="list-link"><div></div></a>

        <div class="icons">
          <!-- Up-down arrows for moving list position -->
          {#if $ordered.length > 1}
          <div class="arrow-icons">
            {#if settings.reverseLists ? i < $ordered.length-1 : i > 0}
              <i class="fas fa-arrow-up clickable no-transform" title="Move list up"
              on:click={() => move(list.id, settings.reverseLists ? i+1 : i-1)}>
            </i>
            {/if}
            {#if settings.reverseLists ? i > 0 : i < $ordered.length-1}
              <i class="fas fa-arrow-down clickable no-transform" title="Move list down"
              on:click={() => move(list.id, settings.reverseLists ? i-1 : i+1)}>
            </i>
            {/if}
          </div>
          {/if}

          <!-- Drag and drop handle for moving list position-->
          <i class="fas fa-grip-vertical clickable" draggable="true" on:dragstart={e => ondragstart(e, list.id)} title="Hold to drag list up/down"></i>

          {#if list.meta.saveState != null}
            <div class="spinner">
              <!-- Saving spinner, 1.2em vs 1.1em size on other icons makes spinner attract attention -->
              <Spinner size="1.2em" state={list.meta.saveState}/>
            </div>
          {:else}
            <!-- Archive button for the list -->
            <i class="{list.meta.archived ? 'fas' : 'far'} fa-box-archive clickable"
            class:archived={list.meta.archived}
            title={`${list.meta.archived ? 'Unarchive' : 'Archive'} List`}
            on:click={async () => {
              if (list.meta.archived) {
                await store.unarchive(list.id)
              } else {
                await store.archive(list.id)
              }
            }}></i>
            <!-- Delete button for the list -->
            {#if !list.meta.archived}
              <i class="fas fa-times clickable"
              on:click={() => deleteList(list.id)}
              title="Delete List"
              ></i>
            {/if}
          {/if}
        </div>

        <div class="icons-mobile">
          <button class="transparent edit-toggle"
          on:pointerup|preventDefault={() => {
            showEditMenu[list.id] = !showEditMenu[list.id]
            // Close any other open edit menus
            for (const id in showEditMenu) {
              if (id !== list.id && showEditMenu[id]) {
                delete showEditMenu[id]
              }
            }
          }} on:click|stopPropagation>
            <i class="fas fa-ellipsis-vertical"/>
          </button>
          <EditMenu id={list.id} bind:show={showEditMenu[list.id]}
            on:edit-title={() => editTitle(list.id)}
          />
        </div>
      </div>
    </div>
  {/each}
  {:else}
    <div class="row no-grid" class:dark={settings.darkMode}>
      <header>It's empty here...</header>
    </div>
  {/if}
  {#if !settings.reverseLists}
    <CreateListForm {settings}>
      <svelte:fragment slot="icon">
        {#if $ordered.length === 0}
          <button class="bold">Create List</button>
        {:else}
          <i class="fas fa-plus"></i>
        {/if}
      </svelte:fragment>
    </CreateListForm>
  {/if}
{:catch err}
  <pre>{err instanceof Error ? err : `Error: ${err}`}</pre>
{/await}
</div>

<style lang="scss">
  @import './icons.scss';
  @import './options-panel.scss';

  .card {
    background: $bg-primary;
    @media all and (min-width: $desktop-min) {
      min-width: 800px;
      max-width: 1200px;
      margin-top: 25px;
    }
    @media all and (max-width: $mobile-max) {
      width: 100%;
    }
    pre {
      margin: 0;
      text-align: center;
      color: red;
    }
    overflow: visible;
  }
  .row {
    --side-margin: 5rem;
    color: initial;
    text-align: center;
    &:not(.no-grid) {
      display: grid;
      grid-auto-flow: column;
      @media all and (max-width: $mobile-max) {
        grid-template-columns: minmax(min-content, 1fr) minmax(0, auto) 1fr;
      }
      @media all and (min-width: $desktop-min) {
        grid-template-columns: minmax(5rem, 1fr) minmax(0, auto) minmax(5rem, 1fr);
      }
    }
    width: 100%;
  }

  // Row sections
  .row-start {
    width: 100%;
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: max-content 1fr;
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
    border-right: 1px solid $border-alt;
  }
  p.item-count {
    margin: 0.5rem 0.8rem;
  }

  .row.highlighted {
    border-left: var(--bold-blue) 2px solid;
    border-right: var(--bold-blue) 2px solid;
  }
  .header-container {
    border-bottom: 1px $border-alt solid;
    display: flex;
    flex-direction: column;
    justify-content: center;
    color: currentColor;
  }
  // Display desktop or mobile header container based on screen width
  .header-container-desktop:not(.editing-header-container) {
    @media all and (max-width: $mobile-max) {
      display: none; 
    }
  }
  .header-container-mobile {
    @media all and (min-width: $desktop-min) {
      display: none;
    }
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
  @media all and (max-width: $mobile-max) {
    .icons {
      display: none;
    }
    .icons-mobile {
      display: flex;
      flex-direction: row;
      justify-content: end;
      align-items: center;
      position: relative;
      button {
        touch-action: manipulation;
        padding: 0 1rem;
        margin: 0;
        height: 100%;
        color: #111;
      }
    }
  }
  @media all and (min-width: $desktop-min) {
    .icons-mobile {
      display: none;
    }
    .arrow-icons i:not(:last-child) {
      margin-right: 0.3rem;
    }
    .arrow-icons i:last-child {
      margin-left: 0.3rem;
    }
    i.fa-box-archive {
      margin-left: 0.3rem;
      &:not(:last-child) {
        margin-right: 0.3rem;
      }
      &.archived {
        color: $danger-red;
      }
    }
  }

  .row:hover, .row-center:hover {
    background-color: $bg-hover;
  }
  /* Create separators */
  .row:not(:last-child),.row-center.border {
    border-bottom: $border-alt 1px solid;
  }
  .row.empty {
    min-height: 3rem;
  }
</style>

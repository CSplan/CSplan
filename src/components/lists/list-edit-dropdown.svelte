<script lang="ts">
  import store, { ordered } from '$stores/lists'
  import DeleteConfirmationModal from '$components/modals/confirm-modal.svelte'
  import { createEventDispatcher } from 'svelte'

  export let show = false
  export let id = ''

  // Events
  const dispatch = createEventDispatcher()

  // Delete confirmation
  let showDeleteConfirmationModal = false
  $: deleteMessage = `Are you sure you want to delete '${$store[id]?.title}'?`

  async function deleteList(): Promise<void> {
    // Delete any lists with no items without prompting for confirmation
    if ($store[id].items.length === 0) {
      await store.delete(id)
      return
    }

    // Store the ID of the list pending deletion, and prompt the user for final confirmation
    show = false
    showDeleteConfirmationModal = true
  }

  async function onDelete(): Promise<void> {
    await store.delete(id)
    show = false
  }

  /** @see title-view.svelte */
  async function moveItem(id: string, index: number): Promise<void> {
    await store.move(id, index)
    await store.commit(id)
  }
</script>

<DeleteConfirmationModal bind:show={showDeleteConfirmationModal} message={deleteMessage} on:submit={onDelete}/>

<svelte:window on:click={() => {
  if (show) {
    show = false
  }
}}/>

{#if show}
<section class="card" on:click|stopPropagation> <!-- Stop propagation to window click handler -->
  <button class="transparent close-button" on:click={() => {
    show = false
  }}>
    <span>Close</span>
    <i class="fas fa-arrow-left"></i>
  </button>

  <header>Move List</header>
  <div class="arrow-buttons">
    {#if $store[id].index > 0}
      <button class="transparent in-row" on:click={() => moveItem(id, $store[id].index - 1)}>
        <i class="fas fa-arrow-up"></i>
      </button> 
    {/if}
    {#if $store[id].index < $ordered.length - 1}
      <button class="transparent in-row" on:click={() => moveItem(id, $store[id].index + 1)}>
        <i class="fas fa-arrow-down"></i>
      </button>
    {/if}
  </div>

  <button class="transparent" on:click={() => {
    show = false
    dispatch('edit-title')
  }}>
    <span>Edit Title</span>
    <i class="fas fa-pencil"></i>
  </button>
  <button class="transparent delete-button" on:click={deleteList}>
    <span>Delete List</span>
    <i class="fas fa-times"></i>
  </button>
</section>
{/if}

<style lang="scss">
  section {
    position: absolute;
    top: 100%;
    right: 0;
    padding: 0;
    margin-bottom: 0;
    width: max-content;
    border-radius: $br-light !important;
    box-shadow: -0.5rem 0.3rem 1rem #aaa;
    z-index: 1;
  }
  button:not(.in-row) {
    display: grid;
    grid-template-columns: 1fr auto;
    padding: 0.5rem 1rem;
    i {
      margin: auto 0.5rem;
    }
  }
  button,div.arrow-buttons {
    margin: 0;
    width: 100%;
    color: currentColor;
  }
  div.arrow-buttons {
    padding: 0;
    display: flex;
    flex-direction: row;
    border-bottom: 1px #ccc solid;
    button {
      border-bottom: none;
      border-radius: 0;
      margin: 0;
      &:first-child {
        border-right: 1px solid #ccc;
      }
      &:last-child {
        border-left: 1px solid #ccc;
      }
    }
  }
  header {
    font-weight: normal;
    padding: 0.3rem 1rem;
    border-bottom: 1px #ccc solid;
    text-align: center;
  }
  button:not(:last-child) {
    border-bottom: 1px #ccc solid;
  }
  button.delete-button {
    color: $danger-red;
  }
</style>
<script lang="ts">
  import store from '$stores/lists'
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
</script>

<DeleteConfirmationModal bind:show={showDeleteConfirmationModal} message={deleteMessage} on:submit={onDelete}/>

<svelte:window on:click={() => {
  if (show) {
    show = false
  }
}}/>

{#if show}
<section class="card" on:click|stopPropagation> <!-- Stop propagation to window click handler -->
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
  <button class="transparent close-button" on:click={() => {
    show = false
  }}>
    <span>Close</span>
    <i class="fas fa-arrow-left"></i>
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
  button {
    margin: 0;
    padding: 0.5rem 1rem;
    color: currentColor;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr auto;
    i {
      margin: auto 0.5rem;
    }
  }
  button:not(:last-child) {
    border-bottom: 1px #ccc solid;
  }
  button.delete-button {
    color: $danger-red;
  }
</style>
<script lang="ts">
  import Modal from '$components/modals/modal.svelte'
  import store from '$stores/lists'
  import DeleteConfirmationModal from '$components/modals/confirm-modal.svelte'

  export let show = false
  export let id = ''

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
    showDeleteConfirmationModal = true
  }

  async function onDelete(): Promise<void> {
    await store.delete(id)
    show = false
  }
</script>

<DeleteConfirmationModal bind:show={showDeleteConfirmationModal} message={deleteMessage} on:submit={onDelete}/>

<Modal bind:show lock mobile bottom>
  <section class="card">
    <button class="transparent">
      <span>Edit Title</span>
      <i class="fas fa-pencil"></i>
    </button>
    <button class="transparent delete-button" on:click={deleteList}>
      <span>Delete List</span>
      <i class="fas fa-times"></i>
    </button>
    <button class="transparent close-button" on:click={() => show = false}>
      <span>Close</span>
      <i class="fas fa-arrow-left"></i>
    </button>
  </section>
</Modal>

<style lang="scss">
  section {
    margin-bottom: 0;
  }
  button {
    margin: 0;
    padding: 0.5rem 1rem;
    color: currentColor;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr auto;
    font-size: 110%;
    i {
      margin: auto 1.5rem;
    }
  }
  button:not(:last-child) {
    border-bottom: 1px #ccc solid;
  }
  button.delete-button {
    color: $danger-red;
  }
</style>
<script lang="ts">
  import Modal from './modal.svelte'
  import ModalContent from './modal-content.svelte'
  import lists from '$stores/lists'
  export let show = false

  let title = ''

  // Create the list and close the modal
  async function createList(): Promise<void> {
    show = false
    await lists.create({ title, items: [] })
    title = ''
  }
</script>

<!-- Modal to create a new list-->
<Modal bind:show>
  <ModalContent>
    <form spellcheck="false" on:submit|preventDefault={createList}>
      <input type="text" placeholder="Title" bind:value={title}>
      <input type="submit" value="Create List">
    </form>
  </ModalContent>
</Modal>

<style lang="scss">
  form {
    padding: 1.5rem;
    padding-bottom: 0.7rem;
    input[type="submit"] {
      margin-top: 0.8rem;
    }
  }
</style>
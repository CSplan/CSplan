<script lang="ts">
  import Modal from './modal.svelte'
  import ModalContent from './modal-content.svelte'
  import tags from '$stores/tags'
  export let show = false
  // FIXME: include color picker in tag creation modal

  const tagSkeleton: TagData = {
    name: '',
    color: '#FFF',
    textColor: '#000'
  }
  let tag = { ...tagSkeleton }
  async function createTag(): Promise<void> {
    show = false
    await tags.create(tag)
    tag = { ...tagSkeleton }
  }
</script>

<Modal bind:show>
  <ModalContent>
    <form>
      <input type="text" placeholder="Tag Name" bind:value={tag.name}>
      <input type="submit" value="Create" on:click|preventDefault={createTag}>
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
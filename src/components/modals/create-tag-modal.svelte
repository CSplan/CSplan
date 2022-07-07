<script lang="ts">
  import Modal from './modal.svelte'
  import ModalContent from './modal-content.svelte'
  import tags from '$stores/tags'
  import colors from '$components/color-picker/colors/colors'
  export let show = false
  // FIXME: Make tag creation similar to list creation
  
  const pastels = Object.values(colors.pastel)
  let lastPastel: string
  // Return a random pastel color, used for new tags
  function randomPastel(): string {
    let result: string
    do {
      result = pastels[Math.floor(Math.random() * pastels.length)]
    } while (result === lastPastel)
    lastPastel = result
    return result
  }

  const tagSkeleton: TagData = {
    name: '',
    color: randomPastel(),
    textColor: '#000'
  }
  let tag = { ...tagSkeleton }
  async function createTag(): Promise<void> {
    show = false
    await tags.create(tag)
    tagSkeleton.color = randomPastel()
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
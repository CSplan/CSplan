<script context="module">
  /* eslint-disable */
  import { toggleModal } from '../misc/modals'

  // Element referencing the modal
  let el
  export function toggleTagModal() {
    toggleModal(el)
  }
</script>

<script>
  import { onMount } from 'svelte'
  import tags from '../stores/tags'

  onMount(() => {
    el = document.querySelector('#createTagModal')
  })

  const tagSkeleton = {
    name: '',
    color: '#FFFFFF'
  }
  let tag = { ...tagSkeleton }
  async function createTag() {
    toggleTagModal()
    await tags.create(tag)
    tag = { ...tagSkeleton }
  }
</script>

<svelte:head>
  <link rel="stylesheet" href="/css/modals.css">
</svelte:head>

<div class="modal">
  <input id="createTagModal" type="checkbox">
  <label for="createTagModal" class="overlay" on:click|preventDefault>
    <i class="fas fa-times clickable" on:click={toggleTagModal}></i>
  </label>
  <form class="card">
    <input type="text" placeholder="Name" bind:value={tag.name}>
    <input type="submit" value="Create" on:click|preventDefault={createTag}>
  </form>
</div>
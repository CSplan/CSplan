<script context="module">
  export function toggleModal() {
    const el = document.querySelector('#createListModal')
    el.checked = !el.checked
    // Handle escape key presses to exit modal
    if (el.checked) {
      document.addEventListener('keydown', modalKeydown)
    } else {
      document.removeEventListener('keydown', modalKeydown)
    }
  }

  function modalKeydown(evt) {
    if (evt.key === 'Escape') {
      toggleModal()
    }
  }

</script>

<script>
  import lists from '../stores/lists'
  import { createEventDispatcher, tick } from 'svelte'
  const dispatch = createEventDispatcher()

  // Data skeleton for new list
  let listSkeleton = {
    title: '',
    items: []
  }
  async function newListItem() {
    listSkeleton.items.push({
      title: '',
      description: '',
      category: '',
      done: false
    })
    listSkeleton = listSkeleton // Trigger reactivity render
    // Wait for the DOM to update and then focus the element
    await tick()
    document.querySelector(`[data-item="${listSkeleton.items.length - 1}"]`).focus()
  }

  async function createList() {
    dispatch('loadingChange', {
      isLoading: true
    })
    toggleModal()
    await lists.create(listSkeleton)
    listSkeleton = {
      title: '',
      items: []
    }
    dispatch('loadingChange', {
      isLoading: false
    })
  }
</script>

<svelte:head>
  <link rel="stylesheet" href="/css/modals.css">
</svelte:head>

<!-- Modal to create a new list-->
<div class="modal">
  <input id="createListModal" type="checkbox">
  <label for="createListModal" class="overlay" on:click|preventDefault>
    <i class="fas fa-times clickable" on:click={toggleModal}></i>
  </label>
  <form class="card" spellcheck="false">
    <input type="text" placeholder="Title" bind:value={listSkeleton.title}>
    <header>Items
      <i class="fas fa-plus clickable ml-05" on:click={newListItem}></i>
    </header>
    <div class="column">
      {#each listSkeleton.items as _, i}
      <div class="column left-border">
        <input data-item={i} type="text" placeholder="Item Title" bind:value={listSkeleton.items[i].title}>
        <textarea placeholder="Item Description" bind:value={listSkeleton.items[i].description}></textarea>
      </div>
      {/each}
    </div>
    <input type="submit" value="Create" on:click|preventDefault={createList}>
  </form>
</div>

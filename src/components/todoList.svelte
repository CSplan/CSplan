<script>
  import { onMount, onDestroy } from 'svelte'
  import lists from '../stores/lists'
  import Spinner from './spinner.svelte'
  import { contenteditableKeypress } from '../misc/contenteditable'
  import { fade } from 'svelte/transition'

  export let id

  // Skeleton for new items
  const itemSkeleton = {
    title: '',
    description: '',
    category: '',
    done: false    
  }

  let list
  let hasList = false
  let saveStates = {
    resting: 0,
    saving: 1,
    success: 2,
    error: 3
  }
  let saveState = saveStates.resting
  onMount(async () => {
    await lists.init()
    list = $lists[id]
    hasList = true
    document.addEventListener('keypress', handleKeypress)
  })
  onDestroy(() => {
    document.removeEventListener('keypress', handleKeypress)
  })

  function handleKeypress(evt) {
    if (evt.key.toLowerCase() === 's') {
      saveAndCommit()
    }
  }

  async function toggleItem(index) {
    const updatedItems = [ ...$lists[id].items ]
    updatedItems[index].done = !updatedItems[index].done
    await lists.update(id, {
      items: updatedItems
    })
    list = $lists[id] // Trigger render update
  }

  async function addItem() {
    list.items.push({...itemSkeleton}) // js randomly implementing pointers amirite
    list.items = list.items
    await saveAndCommit()
  }
  async function deleteItem(index) {
    list.items.splice(index, 1)
    await saveAndCommit()
    list.items = list.items // Trigger render update
  }

  let timeout
  async function saveAndCommit() {
    // Wait .5s before showing a loading icon
    timeout = setTimeout(() => {
      saveState = saveStates.saving
    }, 500)
    await lists.update(id, {
      ...list
    })
    await lists.commit(id)
    saveState = saveStates.success
    clearTimeout(timeout)
    timeout = 0
    setTimeout(() => {
      if (!timeout) {
        saveState = saveStates.resting
      }
    }, 300)
  }
</script>

{#if hasList}
<div class="card">
  <header class="title">{list.title}</header>
  {#each list.items as item, i}
  <div class="row item-title marginless">
    <i class="clickable checkbox { item.done ? 'fas fa-check-circle' : 'far fa-circle'}" on:click={() => toggleItem(i)}></i>
    <header contenteditable on:keypress={contenteditableKeypress} bind:textContent={list.items[i].title} on:blur={saveAndCommit}>{item.title}</header>
    <div class="icons">
      <i class="fas fa-times clickable" on:click={() => deleteItem(i)}></i>
    </div>
  </div>
  {/each}
  <div class="row centered clickable" on:click={addItem}>
    <i class="fas fa-plus"></i>
  </div>
  <div class="corner">
  {#if saveState === saveStates.saving}
    <Spinner size="1.5rem"/>
  {:else if saveState === saveStates.success}
    <i class="fas fa-check bold" transition:fade={{ duration: 300 }}></i>
  {/if}
  </div>
</div>
{/if}

<style>
  header.title {
    font-size: 24px;
    padding: 0.5rem;
    text-align: center;
    margin-bottom: 0.5rem;
  }

  div.item-title {
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    margin-left: 0.5rem;
  }
  .card {
    margin-top: 10vh;
    min-width: 800px;
  }
  i.checkbox {
    font-size: 1.75rem;
  }

  .row {
    color: initial;
    text-align: center;
    display: flex;
    flex-direction: row;
    justify-content: left;
    align-items: center;
    position: relative;
    width: 100%;
  }
  .row.centered {
    justify-content: center;
  }
  .row .icons {
    position: absolute;
    right: 0;
    margin: 0.25rem;
  }
  .row .icons i:hover {
    transform: scale(1.25)
  }
  .row:hover {
    background: whitesmoke;
  }
  /* Create separators */
  .row:not(:last-child) {
    border-bottom: #ccc 1px solid;
  }
  i {
    margin: 0.5rem;
  }

  .corner {
    position: absolute;
    top: 0.5rem;
    left: 0.5rem;
  }
</style>

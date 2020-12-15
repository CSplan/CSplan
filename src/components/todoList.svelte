<script>
  import { onMount, onDestroy, tick } from 'svelte'
  import lists from '../stores/lists'
  import Spinner from './spinner.svelte'
  import { contenteditableKeypress, formElementIsFocused } from '../misc/contenteditable'
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
  const fadeDuration = 250

  onMount(async () => {
    await lists.init()
    list = $lists[id]
    hasList = true
    document.addEventListener('keypress', handleKeypress)
  })
  onDestroy(() => {
    process.browser && document.removeEventListener('keypress', handleKeypress)
  })

  function handleKeypress(evt) {
    if (formElementIsFocused()) {
      return
    } else if (evt.key.toLowerCase() === 's') {
      saveAndCommit()
    }
  }

  async function toggleItem(index) {
    const updatedItems = [...$lists[id].items]
    updatedItems[index].done = !updatedItems[index].done
    await lists.update(id, {
      items: updatedItems
    })
    list = $lists[id] // Trigger render update
    // Immediately commit the change if on mobile for a better UX
    if (screen.width < 960) {
      await saveAndCommit()
    }
  }

  async function addItem() {
    list.items.push({ ...itemSkeleton }) // js randomly implementing pointers amirite
    list.items = list.items
    // Wait for the DOM to update and focus the new item 
    await tick()
    document.querySelector(`[data-index="${list.items.length - 1}"]`).focus()

    await saveAndCommit()
  }
  async function deleteItem(index) {
    list.items.splice(index, 1)
    await saveAndCommit()
    list.items = list.items // Trigger render update
  }

  let cooldown = false
  async function saveAndCommit() {
    if (saveState !== saveStates.resting || cooldown) {
      return
    }
    cooldown = true
    // Wait .5s before showing a loading icon
    lists.update(id, {
      ...list
    })
    let timeout = setTimeout(() => {
      saveState = saveStates.saving
    }, 500)
    await lists.commit(id)
    clearTimeout(timeout)
    saveState = saveStates.success
    setTimeout(() => {
      saveState = saveStates.resting
    }, fadeDuration)
    // To avoid DOM errors, we need to wait for 2*fadeDuration before allowing the user to save again (fade in + fade out)
    setTimeout(() => {
      cooldown = false
    }, 2*fadeDuration)
  }
</script>

{#if hasList}
<div class="card">
  <header class="title">{list.title}</header>
  {#each list.items as item, i}
  <div class="row item-title marginless">
    <i class="clickable checkbox { item.done ? 'fas fa-check-circle' : 'far fa-circle'}" on:click={() => toggleItem(i)}></i>
    <div class="content">
      <header data-index={i} contenteditable spellcheck="false" on:keypress={contenteditableKeypress} bind:textContent={list.items[i].title} on:blur={saveAndCommit}>{item.title}</header>
      <p class="hide-empty" contenteditable spellcheck="false" bind:textContent={list.items[i].description} on:blur={saveAndCommit}>{item.description}</p>  
    </div>
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
      <i class="fas fa-check bold" transition:fade={{ duration: fadeDuration }}></i>
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
    margin-top: 10vh !important;
  }
  .row header, .row p {
    max-width: 100%;
    word-break: break-word;
    margin-right: 2rem;
  }
  @media screen and (min-width: 960px) {
    .card {
      min-width: 800px;
      max-width: 1200px;
    }
  }
  @media screen and (max-width: 960px) {
    .card {
      margin: 2rem;
    }
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
  .row .content {
    color: initial;
    text-align: center;
    display: flex;
    flex-direction: column;
    text-align: left;
  }
  .row .content * {
    border: none;
    padding: 0;
    margin-top: 0;
    margin-bottom: 0;
  }

  /* Slight padding above the title and below the description (only if it isn't empty)*/
  .row .content header {
    padding-top: 0.2rem;
  }
  .row .content p:not(:empty) {
    padding-bottom: 0.2rem;
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
    transform: scale(1.25);
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

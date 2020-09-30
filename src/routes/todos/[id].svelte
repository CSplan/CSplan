<script context="module">
  export async function preload(page) {
    return {
      id: page.params.id
    }
  }
</script>

<script>
  import { contenteditableKeypress } from '../../misc/contenteditable'
  import Navbar from '../../components/navbar.svelte'
  import lists from '../../stores/lists';
  import { onMount } from 'svelte'

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
  onMount(async () => {
    await lists.init()
    list = $lists[id]
    hasList = true
  }) 

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

  async function saveAndCommit() {
    await lists.update(id, {
      ...list
    })
    await lists.commit(id)
  }
</script>

<Navbar/>

<main class="container">
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
</div>
{/if}
</main>

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
  .row .icons-left {
    position: absolute;
    left: 0;
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
  .row.noborder {
    border-bottom: none;
  }
  .row.empty {
    min-height: 3rem;
  }
  i {
    margin: 0.5rem;
  }
</style>
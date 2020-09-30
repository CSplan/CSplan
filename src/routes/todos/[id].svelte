<script context="module">
  export async function preload(page, session) {
    return page.params
  }
</script>

<script>
  import { getByKey } from '../../db'
  import { onMount } from 'svelte'
  import navbar from '../../components/navbar.svelte'

  export let id
  let listPromise
  onMount(() => listPromise = getList(id))

  // TODO: this is horrible
  async function getList(id) {
    // Try to get from IDB
    const list = await getByKey('lists', id)
    return list
  }
</script>

<svelte:component this={navbar}></svelte:component>

{#await listPromise then list}
{#if list && list.id}
<div class="card">
  <header>{list.title}</header>
  {#each list.items as item}
  <div>
    <header>{item.title}</header>
  </div>
  {/each}
</div>
{/if}
{/await}

<style>
  .card {
    margin-top: 10vh;
    min-width: 800px;
  }
</style>
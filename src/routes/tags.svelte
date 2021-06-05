<script>
  import Tag from '../components/tag.svelte'
  import Modal, { toggleTagModal } from '../components/create-tag-modal.svelte'
  import { onMount } from 'svelte'
  import Navbar from '../components/navbar.svelte'
  import { ordered, tags } from '../stores/tags'
  import Loading from '../components/loading.svelte'

  const states = {
    init: 0,
    resting: 1,
    error: 2
  }
  let state = states.init
  let stateMsg = ''

  onMount(async () => {
    try {
      await tags.init()
    } catch (err) {
      console.log(err)
      state = state.error
      stateMsg = err
      return
    }
    state = states.resting
  })
</script>

<Navbar/>

<Modal/>

{#if state === states.init}
  <Loading/>
{:else if state === states.resting}
<main class="align-center">
  {#if $ordered.length > 0}
    {#each $ordered as tag (tag.id)}
      <Tag id={tag.id}></Tag>
    {/each}

  {:else}
    <div class="card">
      <header>It's empty here...</header>
      <p>
        Tags are objects with names and colors that can be applied to items on your lists.
        Click the button below to make one.
      </p>
    </div>
  {/if}
  <div class="card add-tag-button clickable" on:click={toggleTagModal}>
    <i class="fas fa-plus"></i>
  </div>
</main>
{:else if state === states.error}
  <main class="container">
    <pre>{stateMsg}</pre>
  </main>
{/if}


<style>
  main.align-center {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .card {
    margin-top: 1.5rem;
  }

  /* Add tag styles */
  @media screen and (min-width: 1200px) {
    .add-tag-button {
      min-width: 800px !important;
    }
  }
  .add-tag-button {
    padding: 0.3rem 0;
    margin-top: 1rem;
    margin-bottom: 2rem;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }
  .add-tag-button i {
    margin: 0.3rem;
  }
  .add-tag-button:hover {
    background: whitesmoke;
  }
  .add-tag-button:not(:last-child) {
    display: none;
  }
</style>
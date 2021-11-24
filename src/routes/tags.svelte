<script>
  import Tag from '$components/tag.svelte'
  import { onMount } from 'svelte'
  import { ordered, tags } from '$stores/tags'
  import Loading from '$components/loading.svelte'
  import Testmodal from '$components/modals/testmodal.svelte'
  let showModal = false

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
      state = state.error
      stateMsg = err
      return
    }
    state = states.resting
  })
</script>

<Testmodal bind:show={showModal}/>

{#if state === states.init}
  <Loading/>
{:else if state === states.resting}
<main class="container">
  {#if $ordered.length > 0}
    {#each $ordered as tag (tag.id)}
      <Tag id={tag.id}></Tag>
    {/each}

  {:else}
    <div class="card">
      <header>It's empty here...</header>
      <p>
        Tags let you categorize items on your lists by name and color. Click the button below to create one.
      </p>
    </div>
  {/if}
  <div class="card add-tag-button clickable" on:click={() => showModal = !showModal}>
    <i class="fas fa-plus"></i>
  </div>
</main>
{:else if state === states.error}
  <main class="container">
    <pre>{stateMsg}</pre>
  </main>
{/if}


<style>
  .card {
    margin-top: 1.5rem;
  }

  /* Add tag styles */
  @media screen and (min-width: 850px) {
    .add-tag-button {
      min-width: var(--content-large) !important;
    }
    .card {
      width: var(--content-large) !important;
    }
  }
  .add-tag-button {
    padding: 0.3rem 0;
    margin-top: 1rem;
    margin-bottom: 2rem;
    width: 100%;
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
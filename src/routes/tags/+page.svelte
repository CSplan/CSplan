<script lang="ts">
  import Tag from '$components/tag.svelte'
  import { onMount } from 'svelte'
  import { ordered, tags } from '$stores/tags'
  import Loading from '$components/loading.svelte'
  import Modal from '$components/modals/create-tag-modal.svelte'
  import VerificationBanner from '$components/banner/verification-banner.svelte'
  import { FormStates as States } from '$lib/form-states'
  import type { PageData } from './$types'
  export let data: PageData

  let showModal = false

  let state = States.Loading
  let message = ''

  onMount(async () => {
    try {
      await tags.init()
      state = States.Resting
    } catch (err) {
      state = States.Errored
      message = err instanceof Error ? err.message : `${err}`
    }
  })
</script>

<Modal bind:show={showModal}/>

{#if state === States.Loading}
  <Loading/>
{:else if state === States.Resting}
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
  <div class="card add-tag-button clickable" on:click={() => showModal = true}>
    <i class="fas fa-plus"></i>
  </div>
</main>
{:else if state === States.Errored}
  <main class="container">
    <pre>{message}</pre>
  </main>
{/if}

<VerificationBanner user={data.user}/>

<style lang="scss">
  .card {
    margin-top: 1.5rem;
  }

  /* Add tag styles */
  @media (min-width: 850px) {
    .add-tag-button {
      min-width: $content-large !important;
    }
    .card {
      width: $content-large !important;
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
    background: $bg-hover;
  }
  .add-tag-button:not(:last-child) {
    display: none;
  }
</style>
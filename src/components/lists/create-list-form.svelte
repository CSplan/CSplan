<script lang="ts">
  import store from '$stores/lists'
  import { tick } from 'svelte'
  export let settings: App.Locals['settings']

  export let show = false

  let title: string
  let titleInput: HTMLInputElement
  let form: HTMLFormElement

  // Create a list from the chin form
  async function createList(): Promise<void> {
    // Validate form
    if (!form.reportValidity()) {
      return
    }

    await store.create({ title, items: [] })
    title = ''
  }

  async function toggleForm(): Promise<void> {
    title = ''
    show = !show
    if (show) {
      await tick()
      titleInput.focus()
    }
  }

  // Clear and hide the form when esc is pressed
  function onkeydown(evt: KeyboardEvent): void {
    if (show && evt.key === 'Escape') {
      toggleForm()
    }
  }
</script>

<svelte:window on:keydown={onkeydown}></svelte:window>

{#if show}
  <form bind:this={form} class="row-create-form"
  class:dark={settings.darkMode} class:top={settings.reverseLists}
  novalidate on:submit|preventDefault={createList}>
    <input type="text" bind:value={title} bind:this={titleInput} placeholder="Title" required>
    <button class="transparent create" title="Create List">
      <i class="fas fa-plus"></i>
    </button>

    <div class="icons">
      <i class="fas fa-times clickable" on:click={toggleForm}></i>
    </div>
  </form>
{:else}
  <section class="row-center clickable" class:top={settings.reverseLists} class:dark={settings.darkMode} on:click={toggleForm}>
    <slot name="icon">
      <i class="fas fa-plus"></i>
    </slot>
  </section>
{/if}

<style lang="scss">
  @import './icons.scss';

  @include titleview-icons;

  // TODO: DRY css between title-view and create-list-form, place common styles in scss files
  .row-center {
    text-align: center;
    padding: 0;
    :global(i) {
      margin: 0.8rem;
    }
    &.top {
      border-bottom: 1px solid $border-alt;
    }
  }
  .row-center:hover {
    background: whitesmoke;
    &.dark {
      background: $bg-lessdark;
    }
  }

  .row-create-form {
    display: grid;
    grid-template-columns: 8fr;
    grid-auto-columns: minmax(max-content, 2fr) max-content;
    grid-auto-flow: column;
    width: 100%;
    &.top {
      border-bottom: 1px solid $border-alt;
      button.create {
        border-bottom: none;
      }
    }
    &:not(.top) {
      button.create {
        border-top: none;
      }
    }

    >* {
      margin: 0;
    }

    // Mimic header styling
    input[type="text"] {
      font-size: 1.1em;
      font-weight: bold;
      padding: .6em .8em;
      border: none;
      margin-top: auto;
    }

    i {
      color: $text-bright;
    }

    button.create {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      padding: 0;
      border: 1px $border-alt solid;
      border-radius: 0;

      i {
        margin: 0.5rem 0.8rem;
      }
    }
  }
</style>
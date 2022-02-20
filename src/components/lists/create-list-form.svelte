<script lang="ts">
  import store from '$stores/lists'

  export let show = false

  let title: string
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

  function toggleForm(): void {
    title = ''
    show = !show
  }
</script>


{#if show}
  <form bind:this={form} class="row-create-form" novalidate on:submit|preventDefault={createList}>
    <input type="text" bind:value={title} placeholder="Title" required>
    <button class="transparent create" title="Create List">
      <i class="fas fa-plus"></i>
    </button>

    <div class="icons">
      <i class="fas fa-times clickable" on:click={toggleForm}></i>
    </div>
  </form>
{:else}
  <section class="row-center clickable" on:click={toggleForm}>
    <i class="fas fa-plus"></i>
  </section>
{/if}

<style lang="scss">
  @import './icons.scss';

  @include titleview-icons;

  // TODO: DRY css between title-view and create-list-form, place common styles in scss files
  .row-center {
    text-align: center;
    padding: 0;
    button,i {
      margin: 0.8rem;
    }
  }

  .row-create-form {
    display: grid;
    grid-template-columns: 8fr;
    grid-auto-columns: minmax(max-content, 2fr) max-content;
    grid-auto-flow: column;
    width: 100%;

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
      color: #111;
    }

    button.create {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      padding: 0;
      border: 1px #aaa solid;
      border-top: none;
      border-radius: 0;

      i {
        margin: 0.5rem 0.8rem;
      }
    }
  }
</style>
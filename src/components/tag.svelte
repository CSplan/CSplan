<script>
  /* eslint-disable */
  export let id
  import tags from '../stores/tags'
  import { states } from './js/states'
  import ColorPicker from './color-picker/color-picker.svelte'
  import { CEkeypress } from '../misc/contenteditable'
  import { onMount } from 'svelte'

  let state = states.loading
  let tag
  let mountColorPicker = false
  let showColorPicker = false

  function toggleColorPicker() {
    if (!mountColorPicker) {
      mountColorPicker = true
    }
    showColorPicker = !showColorPicker
    if (!showColorPicker) {
      tags.commit(id)
    }
  }

  function deleteThis() {
    // Unmount component HTML to avoid any errors caused by values disappearing asynchronously
    state = states.destroyed
    tags.delete(id)
  }

  onMount(() => {
    tag = $tags[id]
    state = states.resting
  })
</script>

<svelte:window on:click={() => showColorPicker && toggleColorPicker()} />

{#if state === states.resting || state === states.updating}
  <div class="card" style="--background-color: {$tags[id].color}">
    <div class="handle" />

    <header
      contenteditable
      spellcheck="false"
      on:keypress={CEkeypress}
      on:input={(e) => tags.update(id, { name: e.target.textContent })}
      on:blur={tags.commit(id)}>
      {tag.name}
    </header>

    <div class="end">
      <div class="handle" />

      <div class="icons" on:click|stopPropagation>
        <div class="toggle {showColorPicker ? 'show' : ''}">
          <i class="fas fa-palette clickable"
          on:click|self={toggleColorPicker}/>
          {#if mountColorPicker}
            <ColorPicker
              on:colorchange={(e) => tags.update(id, { color: e.detail })} />
          {/if}
        </div>

        <i class="fas fa-times clickable" on:click={deleteThis} />
      </div>
    </div>
  </div>
{/if}

<style>
  .card {
    --min-handle: 3rem;
    font-size: 1.25rem;
    margin-bottom: 0;
    width: 100%;
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: minmax(var(--min-handle), 1fr) minmax(0, auto) 1fr;
    background-color: var(--background-color);
    transition: none;

    /* Let color picker overflow tag boundaries when shown */
    overflow: visible;
  }
  .card header {
    margin: 0.5rem;
    padding: 0;
    word-break: break-all;
    border-bottom: none;
  }
  .end {
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: 1fr max-content;
  }

  .card:first-child {
    margin-top: 2rem;
  }
  .card:not(:first-child) {
    margin-top: 1rem;
  }
  @media screen and (min-width: 850px) {
    .card {
      width: 800px;
    }
  }

  .icons {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .icons > * {
    margin: 0.5rem;
  }
  .icons > i:not(first-child) {
    margin-left: 0;
  }
  .icons > i:hover, .icons > div > i:hover {
    transform: scale(1.25);
  }

  .toggle {
    display: block;
    position: relative;
  }
  .toggle :global(.color-picker) {
    display: none;
    position: absolute;
    top: 100%;
    right: 50%;
    z-index: 1;
  }
  .toggle.show :global(.color-picker) {
    display: block;
  }
</style>
<script lang="ts">
  import tags from '$stores/tags'
  import { FormStates as States } from '$lib'
  import ColorPicker from './color-picker/color-picker.svelte'
  import { onMount } from 'svelte'
  import { html2txt } from '$lib/contenteditable/html'

  
  export let id: string

  let state = States.Loading
  
  let mountColorPicker = false
  let mountTextColorPicker = false
  let showColorPicker = false
  let showTextColorPicker = false

  let nameHTML: string

  async function toggleColorPicker(): Promise<void> {
    if (!mountColorPicker) {
      mountColorPicker = true
      mountTextColorPicker = false
    }
    showColorPicker = !showColorPicker
    if (!showColorPicker) {
      await save()
    }
  }
  async function toggleTextColorPicker(): Promise<void> {
    if (!mountTextColorPicker) {
      mountTextColorPicker = true
      mountColorPicker = false
    }
    showTextColorPicker = !showTextColorPicker
    if (!showTextColorPicker) {
      await save()
    }
  }

  // Save the tag to the API
  async function save(): Promise<void> {
    state = States.Saving 
    tags.update((store) => {
      store[id].name = html2txt(nameHTML)
      return store
    })
    await tags.commit(id)
    state = States.Resting
  }

  function deleteThis(): void {
    // Unmount component HTML to avoid any errors caused by values disappearing asynchronously
    state = States.Loading
    tags.delete(id)
  }

  onMount(() => {
    state = States.Resting
  })
</script>

<svelte:window on:click={() => {
  if (showColorPicker) {
    toggleColorPicker()
  }
  if (showTextColorPicker) {
    toggleTextColorPicker()
  }
}} />

{#if [States.Resting, States.Saving].includes(state)}
  <div class="card noborder" style="--background-color: {$tags[id].color}">
    <div class="handle" />

    <header
      style:color={$tags[id].textColor}
      contenteditable
      spellcheck="false"
      bind:innerHTML={nameHTML}
      on:blur={save}>
      {$tags[id].name}
    </header>

    <div class="end">
      <div class="handle" />

      <div class="icons" on:click|stopPropagation>
        <div class="toggle" class:show={showTextColorPicker}>
          <i class="fas fa-text clickable" style:color={$tags[id].textColor}
            on:pointerup|self={toggleTextColorPicker}/>
          {#if mountTextColorPicker}
            <ColorPicker size=small
              on:colorchange={(evt) => {
                tags.update((store) => {
                  store[id].textColor = evt.detail
                  return store
                })
              }}/>
          {/if}
        </div>

        <div class="toggle {showColorPicker ? 'show' : ''}">
          <i class="fas fa-palette clickable" style:color={$tags[id].textColor}
            on:pointerup|self={toggleColorPicker}/>
          {#if mountColorPicker}
            <ColorPicker
              on:colorchange={(evt) => {
                tags.update((store) => {
                  store[id].color = evt.detail
                  return store
                })
              }}/>
          {/if}
        </div>

        <i class="fas fa-times clickable" on:click={deleteThis} style:color={$tags[id].textColor}/>
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  .card {
    --min-handle: 3rem;
    font-size: 1.25rem;
    margin-bottom: 0;
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: minmax(var(--min-handle), 1fr) minmax(0, auto) 1fr;
    background-color: var(--background-color);
    transition: none;

    /* Let color picker overflow tag boundaries when shown */
    overflow: visible;
    @media all and (max-width: $mobile-max) {
      width: 100%;
    }
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
  @media all and (min-width: 850px) {
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
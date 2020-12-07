<script>
  export let id
  import tags from '../stores/tags';
  import ColorPicker from './colorPicker/colorPicker.svelte'
  import { contenteditableKeypress } from '../misc/contenteditable'
  import { onMount } from 'svelte';
  import { parseLightness } from './colorPicker/parseLightness';

  let hasTag = false
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
    hasTag = false
    tags.delete(id)
  }

  onMount(() => {
    tag = $tags[id]
    hasTag = true
  })
</script>

<svelte:window on:click={() => showColorPicker && toggleColorPicker()}/>

{#if hasTag}
<div class="card" style="--background-color: {$tags[id].color}">
  <header contenteditable spellcheck="false" on:keypress={contenteditableKeypress} on:input={(e) => tags.update(id, { name: e.target.textContent })} on:blur={tags.commit(id)}>{tag.name}</header>
  <div class="icons">
    <i class="fas fa-palette clickable toggle {showColorPicker ? 'show' : ''}" on:click|self={toggleColorPicker} on:click|stopPropagation>
      {#if mountColorPicker} 
        <ColorPicker on:colorchange={(e) => tags.update(id, { color: e.detail })}/>
      {/if}
    </i>
    <i class="fas fa-times clickable" on:click={deleteThis}></i>
  </div>
</div>
{/if}

<style>
  .card {
    font-size: 1.25rem;
    margin-bottom: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    overflow: visible;
    background-color: var(--background-color);
    transition: none;
  }
  .card header {
    margin: 0.5rem;
    padding: 0;
    border-bottom: none;
  }
  .card:first-child {
    margin-top: 2rem;
  }
  .card:not(:first-child) {
    margin-top: 1rem;
  }
  @media screen and (min-width: 1200px) {
    .card {
      min-width: 800px;
      max-width: 1200px;
    }
  }

  .icons {
    position: absolute;
    right: 0;
    margin: 0.25rem;
    display: flex;
    flex-direction: row;
  }
  .icons>i {
    margin: 0.25rem;
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

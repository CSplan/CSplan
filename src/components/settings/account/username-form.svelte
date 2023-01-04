<script lang="ts">
  import { tick } from 'svelte'
  import navState, { FormIDs } from '../navigation-state'

  // Display confirmation button before making username editable
  let showEditButton = true

  let inputEl: HTMLInputElement

  // Handle navigation state
  let open = false
  $: open = $navState.isEditing === FormIDs.ChangeUsername
  $: disabled = !open

  // Toggle editing, closing other open forms
  async function toggleEditing(): Promise<void> {
    if (open) {
      inputEl.blur()
      await tick()
      $navState.isEditing = null
      showEditButton = false
    } else {
      $navState.isEditing = FormIDs.ChangeUsername
      showEditButton = false
      await tick()
      inputEl.focus()
    }
  }
</script>

<section class="username primary">
  <div class="input-group" class:highlight={open}>
    <div class="username-symbol" on:pointerdown={() => {
      showEditButton = !showEditButton
    }}>
      <i class="far fa-at"></i>
    </div>

    <input type="text" class="username"
    title="Username"
    placeholder="Anonymous"
    bind:this={inputEl}
    {disabled}>
  </div>

  {#if showEditButton}
    <button class="open-form" on:pointerdown={toggleEditing}>Change Username</button>
  {:else if open}
    <button class="cancel" on:pointerdown={toggleEditing}>Cancel</button>
    <button class="save">Save</button>
  {/if}
</section>

<style lang="scss">
  section.username {
    border: 1px solid $border-normal;
    border-top: none;
    padding: 0.8rem;
    padding-top: 0;
  }
  div.input-group {
    border: 1px solid $border-alt;
    padding: 0;
    &.highlight {
      border-color: $bold-blue;
    }
    margin-bottom: 0.5rem;
  }
  input.username {
    border-left: none;
    pointer-events: none;
    font-weight: 600;
    padding-left: 0.5rem;
    border: none;
    margin: 0;
  }
  div.username-symbol {
    border: 1px solid $border-alt;
    border-right: none;
    height: 2.1em; // To match with input box height defined by picnic
    padding: .3em .6em; // Also to match with input box
    padding-right: 0;
    border: none;
    
    // Center icon
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    i {
      margin: 0 !important;
      cursor: pointer;
    }
  }
  button:not(.transparent) {
    line-height: 1.5;
    padding: .3em .9em;
  }
  button.open-form {
    background-color: $bold-blue;
    width: 100%;
  }
  button.cancel {
    background-color: $danger-red;
    width: 100%;
  }
  button.save {
    background-color: $bold-blue;
    width: 100%;
    margin-top: 0;
  }
</style>

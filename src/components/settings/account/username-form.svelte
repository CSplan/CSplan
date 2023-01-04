<script lang="ts">
  import { tick } from 'svelte'
  import navState, { FormIDs } from '../navigation-state'

  // Display confirmation button before making username editable
  let showEditButton = false
  let showCancel = false

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
      showCancel = false
    } else {
      $navState.isEditing = FormIDs.ChangeUsername
      showEditButton = false
      showCancel = true
      await tick()
      inputEl.focus()
    }
  }
</script>

<section class="username primary">
  <div class="input-group">
    <div class="username-symbol" class:highlight={open} on:pointerdown={() => {
      showEditButton = !showEditButton
    }}>
      <i class="far fa-at"></i>
    </div>

    <input type="text" class="username" class:highlight={open}
    title="Username"
    placeholder="Anonymous"
    bind:this={inputEl}
    {disabled}>
  </div>

  {#if showEditButton}
    <button class="open-form" on:pointerdown={toggleEditing}>Change Username</button>
  {:else if showCancel}
    <button class="cancel" on:pointerdown={toggleEditing}>Cancel</button>
  {/if}
</section>

<style lang="scss">
  section.username {
    border: 1px solid $border-normal;
    border-top: none;
    padding: 0.8rem;
    padding-top: 0;
  }
  input.username {
    border-left: none;
    pointer-events: none;
    font-weight: 600;
    padding-left: 0.5rem;
    &.highlight {
      border-color: $bold-blue;
      transition: none;
    }
  }
  div.username-symbol {
    border: 1px solid $border-alt;
    border-right: none;
    height: 2.1em; // To match with input box height defined by picnic
    padding: .3em .6em; // Also to match with input box
    padding-right: 0;
    &.highlight {
      border-color: $bold-blue;
    }
    
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
</style>

<script lang="ts">
  import { onMount, tick } from 'svelte'
  import navState, { FormIDs } from '../navigation-state'
  import { FormStates, FormStates as States } from '$lib'
  import Spinner from '$components/spinner.svelte'
  import UpgradeModal from '$components/modals/upgrade-modal.svelte'
  import name from '$stores/user/name'

  export let user: App.Locals['user']

  // Form state
  let inputEl: HTMLInputElement
  let state = FormStates.Resting
  let message = ''
  let showUpgradeModal = false
  // Display confirmation button before making username editable
  let showEditButton = false

  // Handle navigation state
  let open = false
  $: open = $navState.isEditing === FormIDs.ChangeUsername
  $: disabled = !open

  // Toggle editing, closing other open forms
  async function toggleEditing(): Promise<void> {
    if (!open && !$name.exists) {
      return
    }
    if (open && [FormStates.Resting, FormStates.Errored].includes(state)) {
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

  /** Create the username */
  async function submit(): Promise<void> {
    if (![FormStates.Resting, FormStates.Errored].includes(state)) {
      return
    }
    try {
      state = States.Saving
      message = ''
      await name.createUsername(inputEl.value)
      await toggleEditing()
      state = States.Saved
      setTimeout(async () => {
        state = States.Resting
        message = ''
      }, 300)
    } catch (err) {
      state = States.Errored
      message = `${err}`
    }
  }

  onMount(async () => {
    await name.init()
    if ($name.exists && $name.username && inputEl.value.length === 0) {
      inputEl.value = $name.username
    }
  })
</script>

<UpgradeModal bind:show={showUpgradeModal}
on:cancel={() => showEditButton = false }
on:upgrade={() => toggleEditing()}
/>

<section class="username primary">
  <div class="input-group" class:highlight={open} title="Username">
    <div class="username-symbol" title="Change username"
    on:pointerdown={() => {
      showEditButton = !showEditButton
    }}>
      <i class="far fa-at" class:disabled={!($name.exists || (user && user.username))}></i>
    </div>

    <input type="text" class="username"
    placeholder="Anonymous"
    value={(user && user.username) ? user.username : ''}
    bind:this={inputEl}
    {disabled}>
  </div>

  {#if showEditButton}
    <button class="open-form" on:pointerdown={() => {
      showUpgradeModal = true
    }}>Change Username</button>
  {:else if open}
    <button class="cancel" on:pointerdown={toggleEditing}>Cancel</button>
    <button class="save" on:pointerdown={submit}>Save</button>
  {/if}

  <Spinner {state} {message}/>
</section>

<style lang="scss">
  section.username {
    border: 1px solid $border-normal;
    border-top: none;
    border-right: none;
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
    &:disabled {
      pointer-events: none;
    }
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
      &.disabled {
        color: $text-disabled;
      }
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

<script lang="ts">
  import { onMount, tick } from 'svelte'
  import navState, { FormIDs } from '../navigation-state'
  import { DisplayNames, FormStates, FormStates as States } from '$lib'
  import Spinner from '$components/spinner.svelte'
  import UpgradeModal from '$components/modals/upgrade-modal.svelte'
  import name, { NameStore } from '$stores/user/name'
  import { invalidateAll } from '$app/navigation'

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
  $: hasUsername = $name.exists && $name.username && $name.username.length > 0 ? true : false
  $: disabled = !open

  // Toggle editing, closing other open forms
  async function toggleEditing(): Promise<void> {
    if (open && [FormStates.Resting, FormStates.Errored].includes(state)) {
      inputEl.blur()
      if ($name.exists && hasUsername && inputEl.value !== $name.username) {
        inputEl.value = $name.username!
      }
      await tick()
      $navState.isEditing = null
      showEditButton = false
    } else {
      state = States.Resting
      message = ''
      $navState.isEditing = FormIDs.ChangeUsername
      showEditButton = false
      await tick()
      inputEl.focus()
    }
  }

  // Username regex
  const usernameRegex = /^[A-Za-z0-9-_]+$/

  /** Create/change the username */
  async function setUsername(): Promise<void> {
    if (![FormStates.Resting, FormStates.Errored].includes(state)) {
      return
    }
    if (!usernameRegex.test(inputEl.value)) {
      inputEl.setCustomValidity('Invalid username. Only alphanumeric characters and the following separators are allowed: -_')
      inputEl.reportValidity()
      return
    } else {
      inputEl.setCustomValidity('')
    }
    try {
      state = States.Saving
      message = ''
      // If no name structure exists for the user, create an empty name
      if (!$name.exists) {
        message = 'Creating empty name profile'
        await name.create(NameStore.EmptyName)
      }

      message = 'Setting username'
      let oldDisplayName: DisplayNames|null = null
      // Delete old username if one exists
      if ($name.exists && hasUsername) {
        // Temporarily change account display name to not include username
        if ([DisplayNames.Username, DisplayNames.FullNameAndUsername].includes($name.displayName)) {
          oldDisplayName = $name.displayName
          await name.updateDisplayName(DisplayNames.Anonymous)
        }
        await name.deleteUsername()
      }

      await name.createUsername(inputEl.value)
      state = States.Saved
      message = 'Username set'
      // Restore old account display name
      if (oldDisplayName !== null) {
        await name.updateDisplayName(oldDisplayName)
        // Trigger navbar reload
        await invalidateAll()
      }
      setTimeout(async () => {
        state = States.Resting
        message = ''
        await toggleEditing()
      }, 300)
    } catch (err) {
      state = States.Errored
      message = `${err}`
    }
  }

  /** Delete the user's username */
  async function deleteUsername(): Promise<void> {
    if (![FormStates.Resting, FormStates.Errored].includes(state)) {
      return
    }
    if (!$name.exists) {
      return
    }
    // If the user's display name includes their username, warn them without sending a request
    if ([DisplayNames.Username, DisplayNames.FullNameAndUsername].includes($name.displayName)) {
      state = States.Errored
      message = 'Cannot delete username because it is included in your current display name preference. Change your display name to resolve this error.'
      return
    }
    try {
      await name.deleteUsername()
      state = States.Saved
      message = 'Username deleted'
      setTimeout(async () => {
        state = States.Resting
        message = ''
        inputEl.value = ''
        await toggleEditing()
      }, 300)
    } catch (err) {
      state = States.Errored
      if (err instanceof Error) {
        message = err.message
      } else {
        message = `${err}`
      }
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
on:upgrade={async () => {
  await invalidateAll()
  await toggleEditing()
}}
/>

<section class="username primary">
  <div class="input-group" class:highlight={open} title="Username">
    <button class="transparent username-symbol" title="Change username"
    on:click={() => {
      // If there is 1 minute or longer before the user's auth upgrade will expire, password input is not needed
        showEditButton = !showEditButton
    }}>
      <i class="far fa-at" class:disabled={!($name.exists || (user && user.username))}></i>
    </button>

    <input type="text" class="username"
    placeholder="Anonymous"
    value={(user && user.username) ? user.username : ''}
    bind:this={inputEl}
    {disabled}>
  </div>

  {#if showEditButton}
      <button class="open-form" on:click={async () => {
        if (user
        && user.authLevel === 2 && user.lastUpgraded !== undefined
        && (Date.now() / 1000) - user.lastUpgraded < (9 * 60)) {
          await toggleEditing()
        } else {
          // Upgrade required, prompt for password input
          showUpgradeModal = true
        }
      }}>{hasUsername ? 'Change' : 'Set'} Username</button>
      {#if hasUsername}
        <p class="warning">
          <b style:color="var(--danger-red)">Warning:</b>
          After changing or deleting your username, you may not be able to get your current one back.
        </p>
      {/if}
  {:else if open && [States.Resting, States.Errored].includes(state)}
      <button class="cancel" on:click={toggleEditing}>Cancel</button>
      <button class="save" on:click={setUsername}>Save</button>
    {#if hasUsername}
      <button class="delete" on:click={deleteUsername}>Delete Username</button>
    {/if}
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
      button.username-symbol {
        background-color: inherit;
      }
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
  button.username-symbol {
    margin: 0;
    transition: none;
    background-color: $bg-darker;
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
  p.warning {
    line-height: 1.25;
    margin-top: 0 !important;
    margin-bottom: 0 !important;
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
  button.delete {
    background-color: $bg-lessdark;
    color: $danger-red;
    border: 1px solid $danger-red;
    width: 100%;
    margin-top: 1rem;
  }
</style>

<script lang="ts">
  import navState, { FormIDs } from '../navigation-state'
  import { PasswordChangeActions } from '$lib/auth-actions'
  import { makeSalt } from 'cs-crypto'
  import { slide } from 'svelte/transition'
  import { dev } from '$app/env'
  import Spinner from '$components/spinner.svelte'

  let open = false
  function toggleOpen(): void {
    open = !open
    if (open) {
      $navState.isEditing = FormIDs.ChangePassword
    } else {
      $navState.isEditing = null
    }
  }
  const oldPlaceholder = '*'.repeat(20)
  const placeholder = '*'.repeat(30)

  let showOldPassword = false
  let showNewPassword = false

  let form: HTMLFormElement
  let oldPassword: HTMLInputElement
  let newPassword: HTMLInputElement
  let confirmPassword: HTMLInputElement

  enum States {
    Resting,
    Submitting,
    Success,
    Errored
  }
  let state = States.Resting
  let statusMessage = ''
  

  const argon2WorkerPath = dev ? '/argon2/worker.js' : '/argon2/worker.min.js'
  const ed25519Path = dev ? '/ed25519/worker.js' : '/ed25519/worker.min.js'
  async function changePassword(): Promise<void> {
    if (confirmPassword.value !== newPassword.value) {
      confirmPassword.setCustomValidity('Password confirmation doesn\'t match')
    } else {
      confirmPassword.setCustomValidity('')
    }

    // Validate the form before allowing submission
    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }
    // Upgrade the current session to level 2 auth
    const actions = new PasswordChangeActions(new Worker(argon2WorkerPath), new Worker(ed25519Path))
    state = States.Submitting
    actions.onMessage = (message: string) => {
      statusMessage = message
    }

    try { 
      await actions.loadArgon2({ wasmRoot: '/argon2', simd: false })
      await actions.loadED25519({ wasmPath: '/ed25519/ed25519.wasm' })
      await actions.authenticate({
        email: '',
        password: oldPassword.value
      }, false, true)
      
      // Perform the password change for both authentication and cryptographic contexts
      const authSalt = makeSalt(16)
      const cryptoSalt = makeSalt(16)
      await actions.changePassword(oldPassword.value, newPassword.value, authSalt, cryptoSalt)
      statusMessage = 'Password was successfully changed'
    } catch (err) {
      statusMessage = (err instanceof Error) ? err.message : err as string
      state = States.Errored
      return
    }
    // TODO: success animation
    state = States.Success
    form.reset()
    setTimeout(() => {
      statusMessage = ''
      state = States.Resting
      toggleOpen()
    }, 1000)
  }
</script>

<form class="password-form" novalidate on:submit|preventDefault={changePassword} bind:this={form}>
  <label for="password">{open ? 'Old ' : ''}Password</label>
  <div class="input-group">
    <input id="password" type="{showOldPassword ? 'text' : 'password'}" bind:this={oldPassword} disabled={!open} placeholder={oldPlaceholder} required>
    <i class="fas fa-edit clickable" class:open on:click={toggleOpen}></i>
  </div>
  {#if open}
    <div class="editable" transition:slide={{ duration: 50 }}>
      <label class="checkable">
        <input type="checkbox" bind:checked={showOldPassword}>
        <span class="checkable">Show Old Password</span>
      </label>

      <label for="new-password">New Password</label>
      <input id="new-password" type="{showNewPassword ? 'text' : 'password'}" bind:this={newPassword} {placeholder} required>
      <label for="confirm-new-password">Confirm New Password</label>
      <input id="confirm-new-password" type="{showNewPassword ? 'text' : 'password'}" bind:this={confirmPassword} {placeholder} required>
      <label class="checkable">
        <input type="checkbox" bind:checked={showNewPassword}>
        <span class="checkable">Show New Passwords</span>
      </label>

      {#if state === States.Submitting}
        <Spinner size="2rem" vm="0.5rem"></Spinner>
      {/if}
      {#if statusMessage.length > 0}
        <span class="status-message" class:error={state === States.Errored} class:success={state === States.Success}>{statusMessage}</span>
      {/if}

      {#if [States.Resting, States.Errored].includes(state)}
        <input type="submit" value="Change Password">
      {/if}
    </div>
  {/if}
</form>

<style lang="scss">
  form.password-form,div.editable {
    display: flex;
    flex-direction: column;
  }
  input[type="submit"] {
    align-self: center;
  }
  :global(i.fa-circle-notch) {
    align-self: center;
  }
  span.status-message {
    align-self: center;
    &.error {
      color: $danger-red;
    }
    &.success {
      color: green;
    }
  }
  i.fa-edit { 
    &.open {
      color: var(--bold-blue);
    }
  }
</style>
<script lang="ts">
  import navState, { FormIDs } from '../navigation-state'
  import { AuthConditions, PasswordChangeActions } from '$lib/auth-actions'
  import { makeSalt } from 'cs-crypto'
  import { slide } from 'svelte/transition'
  import { dev } from '$app/env'

  let open = false
  function onOpen(): void {
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
    await actions.loadArgon2({ wasmRoot: '/argon2', simd: false })
    await actions.loadED25519({ wasmPath: '/ed25519/ed25519.wasm' })
    const result = await actions.authenticate({
      email: '',
      password: oldPassword.value
    }, false, true)
    if (result !== AuthConditions.Upgraded) {
      console.error(`Unexpected auth condition: ${result}`)
    }
    
    // Perform the password change for both authentication and cryptographic contexts
    const authSalt = makeSalt(16)
    const cryptoSalt = makeSalt(16)
    await actions.changePassword(oldPassword.value, newPassword.value, authSalt, cryptoSalt)
    console.log('success changing password!')
  }
</script>

<form class="password-form" novalidate on:submit|preventDefault={changePassword} bind:this={form}>
  <label for="password">{open ? 'Old ' : ''}Password</label>
  <div class="input-group">
    <input id="password" type="{showOldPassword ? 'text' : 'password'}" bind:this={oldPassword} disabled={!open} placeholder={oldPlaceholder} required>
    <i class="fas fa-edit clickable" class:open on:click={onOpen}></i>
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


      <input type="submit" value="Change Password">
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
  i.fa-edit { 
    &.open {
      color: var(--bold-blue);
    }
  }
</style>
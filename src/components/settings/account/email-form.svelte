<script lang="ts">
  import navState, { FormIDs } from '../navigation-state'
  import { FormStates as States } from '$lib/form-states'
  import { slide } from  'svelte/transition'
  import Spinner from '$components/spinner.svelte'
  import user from '$stores/user'
  import { EmailChangeActions, LoginActions } from '$lib/auth-actions'

  let open = false
  $: open = $navState.isEditing === FormIDs.ChangeEmail
  function toggleOpen(): void {
    if (open) {
      $navState.isEditing = null
    } else {
      $navState.isEditing = FormIDs.ChangeEmail
    }
  }

  let unverified = false
  $: unverified = $user.isLoggedIn && !$user.user.verified

  let form: HTMLFormElement
  let newEmail: HTMLInputElement
  let password: HTMLInputElement
  let showPassword = false
  
  let state = States.Resting
  let message = ''

  async function changeEmail(): Promise<void> {
    // !open prevents the form from submitting when the resend verification email button is pressed
    if (!open || !form.reportValidity()) {
      return
    }

    try {
      state = States.Saving
      message = 'Changing Email'
      // Initialize login actions
      const argon2 = new Worker(LoginActions.Argon2_WorkerPath)
      const ed25519 = new Worker(LoginActions.ED25519_WorkerPath)
      const actions = new LoginActions(argon2, ed25519)
      await actions.loadArgon2({
        wasmRoot: LoginActions.Argon2_WASMRoot,
        simd: true
      })
      await actions.loadED25519({
        wasmPath: LoginActions.ED25519_WASMPath
      })

      // Change the user's email address
      await EmailChangeActions.changeEmail(actions, password.value, newEmail.value)
      state = States.Saved
      message = `A verification email has been sent to ${newEmail.value}`

      setTimeout(() => {
        state = States.Resting
        message = ''
        open = false
      }, 3000)
    } catch (err) {
      state = States.Errored
      message = err instanceof Error ? err.message : `Failed to change email: ${err}`
    }
  }

  async function sendVerificationEmail(): Promise<void> {
    try {
      state = States.Saving
      await user.sendVerificationEmail()
    } catch (err) {
      state = States.Errored
      message = err instanceof Error ? err.message : `${err}`
      return
    }
    state = States.Saved
    message = 'Verification email sent.'
    setTimeout(() => {
      state = States.Resting
      message = ''
    }, 3000)
  }

</script>

<form class="email-form" novalidate on:submit|preventDefault={changeEmail} bind:this={form}>
  <label for="email">
    <span>Email</span>
    <div class="input-group">
      <input id="email" type="email" bind:value={$user.user.email} disabled={true} class:unverified>
      <i class="fas fa-edit clickable" class:open on:click={toggleOpen}></i>
    </div>
  </label>
  <!-- Avoid showing anything about verification status until we know it's accurate -->
  {#if $user.isLoggedIn}
    {#if unverified}
      <span class="unverified-message">This email address isn't verified.</span>
      {#if !open}
        <button class="resend-verification" on:click={sendVerificationEmail} disabled={state !== States.Resting}>
          <i class="far fa-envelope"></i>
          Resend Verification Email
        </button>
        <Spinner size="2rem" vm="0.5rem" bind:state bind:message/>
      {/if}
    {:else if !open}
      <span class="verified-message">
        <i class="far fa-envelope-circle-check"></i>
        This email address is verified.
      </span>
    {/if}
  {/if}

  {#if open}
    <div class="editable" transition:slide={{ duration: 50 }}>
      <label>
        <span>New Email</span>
        <input id="new-email" type="email" bind:this={newEmail} required>
      </label>

      <label>
        <span>Password</span>
        <input id="password" type={showPassword ? 'text' : 'password'} bind:this={password} required>
      </label>

      <label class="checkable">
        <input type="checkbox" bind:checked={showPassword} on:change={() => {
          password.focus()
        }}>
        <span class="checkable">Show Password</span>
      </label>

      <Spinner size="2rem" vm="0.5rem" bind:state bind:message/>
    
      {#if [States.Resting, States.Errored].includes(state)}
        <input type="submit" value="Change Email">
      {/if}
    </div>
  {/if}
</form>

<style lang="scss">
  form.email-form,div.editable {
    display: flex;
    flex-direction: column;
    :global {
      i.fa-circle-notch {
        align-self: center;
      }
    }
  }
  input#email.unverified {
    border-color: $danger-red;
  }
  span.unverified-message {
    color: $danger-red;
    margin-top: 0 !important;
  }
  span.verified-message {
    color: $success-green;
    margin-top: 0 !important;
  }
  input#new-email, input#password {
    width: calc(100% - (17.6px + 1.5rem)); // Align with top email field
  }
  input[type="submit"], button.resend-verification {
    align-self: center;
  }
  button.resend-verification { 
    width: auto;
    background: $bg-alt;
    color: white;
    line-height: 1.5;
    padding: .3rem .9rem;
  }
  i.fa-edit.open {
    color: $bold-blue;
  }
</style>
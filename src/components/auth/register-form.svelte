<script lang="ts">
  import { goto } from '$app/navigation'
  import user from '../../stores/user'
  import { makeSalt } from 'cs-crypto'
  import { onMount, tick } from 'svelte'
  import { RegisterActions } from './actions'
  import { dev } from '$app/env'

  // Form data
  let showPassword = false
  let error = ''
  let stateMsg = ''

  // Form state
  const enum States {
    Resting,
    Submitting,
    Error,
    Success
  }
  let state = States.Resting
  
  // Form elements
  let form: HTMLFormElement
  let email: HTMLInputElement
  let password: HTMLInputElement
  let confirmPassword: HTMLInputElement

  // Actions
  let actions: RegisterActions

  // If the user is already logged in, redirect them
  $: {
    if ($user.isLoggedIn && state === States.Resting) {
      goto('/')
    }
  }

  async function register(): Promise<void> {
    // Compare password fields
    if (password.value !== confirmPassword.value) {
      confirmPassword.setCustomValidity('Password confirmation isn\'t the same as password')
      return
    } else {
      // Empty string marks the field as valid
      confirmPassword.setCustomValidity('')
    }

    if (!form.checkValidity()) {
      return
    }

    state = States.Submitting
    try {
      const authSalt = makeSalt(16)
      await actions.register({
        email: email.value,
        password: password.value
      }, authSalt)

      const cryptoSalt = makeSalt(16)
      await actions.generateMasterKeypair(password.value, cryptoSalt)

      await actions.confirmAccount()

      goto('/')
    } catch (err) {
      console.error(err)
      user.logout()
      state = States.Error
      error = err instanceof Error ? err.message : err
    }
  }

  // Mount
  onMount(async () => {
    // Initialize argon2 and ed25519 workers
    const wasmRoot = '/argon2'
    const workerScript = dev ? 'worker.js' : 'worker.min.js'

    const argon2 = new Worker(`${wasmRoot}/${workerScript}`)
    const ed25519 = new Worker(`/ed25519/${workerScript}`)

    // Initialize actions class
    actions = new RegisterActions(argon2, ed25519)
    // Set message handler
    actions.onMessage = async (message: string) => {
      stateMsg = message
      console.log(message)
      await tick()
    }
    // Load argon2 binary, with SIMD support if available
    try {
      await actions.loadArgon2({
        wasmRoot,
        simd: true
      })
      await actions.loadED25519({
        wasmPath: '/ed25519/ed25519.wasm'
      })
    } catch (err) {
      state = States.Error
      error = err.message
    }
  })
</script>


<div class="card register-form">
  <header>Register</header>
  <form bind:this={form} on:submit|preventDefault={register}>
    <input data-field="email" type="email" required autocomplete="email" placeholder="Email" bind:this={email}>
    <input data-field="password" type={ showPassword ? 'text' : 'password'} required autocomplete="new-password" placeholder="Password" bind:this={password}>
    <input data-field="confirmPassword" type={ showPassword ? 'text' : 'password'} required autocomplete="new-password" placeholder="Confirm Password" bind:this={confirmPassword}>
    <label>
      <input type="checkbox" bind:checked={showPassword}>
      <span class="checkable">Show Password</span>
    </label>
    <input type="submit" value="Submit">
  </form>
  <footer>
  {#if state === States.Submitting}
    <span>{stateMsg}</span>
    <i class="fas fa-circle-notch fa-2x"></i>
  {:else if state === States.Error}
    <span class="error">{error}</span>
  {/if}
  </footer>
</div>

<style lang="scss">
  .card {
    margin-top: 20vh;
    max-width: 300px;
    padding: 1rem;
    * {
      margin: 0.5rem 0;
    }
    header {
      padding: 0;
      padding-bottom: 0.5rem;
      text-align: center;
    }
  }
  form {
    display: flex;
    flex-direction: column;
  }

  /* Footer styles */
  @keyframes spin {
    from {transform: rotate(0deg);}
    to {transform: rotate(359deg);}
  }
  i.fa-circle-notch {
    animation-name: spin;
    animation-duration: 1.5s;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
    color: var(--bold-blue);
  }
  footer {
    padding: 0;
    margin: 0 !important;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  span.error {
    color: red;
    font-family: monospace;
  }
</style>
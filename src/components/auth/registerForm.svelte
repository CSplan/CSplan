<script lang="ts" context="module">
 import type { Argon2HashParams } from '../crypto/argon2.js'
 export type Challenge = {
    id: string,
    data: string,
    salt: string,
    hashParams: Argon2HashParams
  }
  export type SolvedChallenge = {
    data: string
  }
  export type ErrorResponse = {
    title: string,
    message: string,
    status: number
  }
  export type ChallengeResponse = {
    id: string,
    CSRFtoken: string
  }
</script>

<script lang="ts">
  import { goto } from '@sapper/app'
  import user from '../../stores/user'
  import { makeSalt } from 'cs-crypto'
  import { onDestroy, onMount, tick } from 'svelte'
  import { RegisterActions } from './actions.js';

  // Form data
  let showPassword = false
  let error = ''
  let stateMsg = ''

  // Form state
  const enum states {
    resting,
    submitting,
    error,
    success
  }
  let state = states.resting
  
  // Form elements
  let form: HTMLFormElement
  let email: HTMLInputElement
  let password: HTMLInputElement
  let confirmPassword: HTMLInputElement

  // Web Worker
  let worker: Worker
  const workerID = 0

  // Actions
  let actions: RegisterActions

  // If the user is already logged in, redirect them
  $: $user.isLoggedIn && state === states.resting && goto('/')

  async function register() {
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

    state = states.submitting
    try {
      const authSalt = makeSalt(16)
      await actions.register(email.value, password.value, authSalt)
      const cryptoSalt = makeSalt(16)
      await actions.generateMasterKeypair(password.value, cryptoSalt)
    } catch (err) {
      console.error(err)
      console.log(stateMsg)
      user.logout()
      state = states.error
      error = err instanceof Error ? err.message : err
      return
    }
    goto('/')
  }

  // Mount
  onMount(async () => {
    // Initialize worker
    const wasmRoot = '/argon2'
    const workerScript = process.env.NODE_ENV === 'development' ? 'worker.js' : 'worker.min.js'
    worker = new Worker(`${wasmRoot}/${workerScript}`)
    // Initialize actions class
    actions = new RegisterActions(worker, workerID)
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
    } catch (err) {
      state = states.error
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
  {#if state === states.submitting}
    <span>{stateMsg}</span>
    <i class="fas fa-circle-notch fa-2x"></i>
  {:else if state === states.error}
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
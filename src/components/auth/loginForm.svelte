<script lang="ts">
  import { LoginActions } from './actions'
  import { onMount } from 'svelte'
  import user from '../../stores/user'
  import route from '../../route'
  import { goto } from '@sapper/app'
  import { Argon2_Actions } from '@very-amused/argon2-wasm/lib/argon2'

  // Elements
  let form: HTMLFormElement
  let email: HTMLInputElement
  let password: HTMLInputElement

  // Web Worker
  let worker: Worker
  const workerID = 0

  // Actions
  let actions: LoginActions

  // Form state management
  const states = {
    resting: 0,
    submitting: 1,
    error: 2,
    success: 3
  }
  let state = states.resting
  let stateMsg = ''
  let error = ''
  let showPassword = false

  async function login() {
    if (!form.checkValidity()) {
      return
    }

    state = states.submitting
  
    try {
      await actions.authenticate(email.value, password.value)
      await actions.retrieveMasterKeypair(password.value)
    } catch (err) {
      console.log(err)
      error = err.message
      state = states.error
    }
    goto('/')
  }

  onMount(async () => {
    if ($user.isLoggedIn) {
      goto('/')
    }
    // Initialize worker
    const wasmRoot = '/argon2'
    const workerScript = process.env.NODE_ENV === 'development' ? 'worker.js' : 'worker.min.js'
    worker = new Worker(`${wasmRoot}/${workerScript}`)
    // Initialize actions with worker
    actions = new LoginActions(worker, workerID)
    try {
      await actions.loadArgon2({
        wasmRoot,
        simd: true
      })
    } catch (err) {
      state = states.error
      error = err.message || 'Failed to load Argon2'
    }
  })
</script>

<div class="card">
  <header>Log In</header>
  <form bind:this={form} on:submit|preventDefault={login}>
    <input bind:this={email} type="email" required autocomplete="email" placeholder="Email">
    <input bind:this={password} type={showPassword ? 'text' : 'password'} required autocomplete="current-password" placeholder="Password">
    <label>
      <input type="checkbox" bind:checked={showPassword}>
      <span class="checkable">Show Password</span>
    </label>
    <input type="submit" value="Submit">
  </form>
  <footer>
    
  {#if state === states.error}
    <span class="error">{error}</span>
  {/if}
  </footer>
</div>

<style lang="scss">
  .card {
    max-width: 300px;
    padding: 1rem;
    margin: 0;
  }
  .card * {
    margin: 0.5rem 0;
  }
  .card header {
    padding: 0;
    padding-bottom: 0.5rem;
    text-align: center;
  }
  form {
    display: flex;
    flex-direction: column;
    margin-bottom: 0;
  }

  /* Footer styles */
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
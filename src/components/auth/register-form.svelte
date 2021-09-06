<script lang="ts">
  import { goto } from '$app/navigation'
  import user from '../../stores/user'
  import { makeSalt } from 'cs-crypto'
  import { onMount, tick } from 'svelte'
  import { RegisterActions } from './actions'
  import { dev } from '$app/env'
  import HashparamsForm from './hashparams-form.svelte'

  // Form data
  let showPassword = false
  let showAdvanced = false
  let error = ''
  let stateMsg = ''

  // Form state
  const enum States {
    Loading,
    Resting,
    Submitting,
    Error,
    Success
  }
  let state = States.Loading
  
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
      form.reportValidity()
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
      return
    }
    state = States.Resting
  })
</script>


<div class="card register-form">
  <header>Register</header>
  <form bind:this={form} on:submit|preventDefault={register}>
    <input data-field="email" type="email" required autocomplete="email" placeholder="Email" bind:this={email}>
    <input id="password" data-field="password" type={ showPassword ? 'text' : 'password'} required autocomplete="new-password" placeholder="Password" bind:this={password}>
    <input data-field="confirmPassword" type={ showPassword ? 'text' : 'password'} required autocomplete="new-password" placeholder="Confirm Password" bind:this={confirmPassword}>
    <label>
      <input type="checkbox" bind:checked={showPassword}>
      <span class="checkable">Show Password</span>
    </label>
    {#if state !== States.Loading} <!-- This isn't rendered until onMount has been run, because it expects actions to be initialized -->
    <details bind:open={showAdvanced}>
      <summary class="clickable"><i class="fas fa-chevron-right"></i>Advanced Cryptography Options</summary>
      <HashparamsForm bind:actions={actions} on:close={() => showAdvanced = false}/>
    </details>
    {/if}
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

<style lang="scss" global>
  .card {
    @media screen and (min-width: 850px) {
      margin-top: 60px; 
      min-width: 300px;
      max-width: 25%;
    }
    @media screen and (max-width: 849px) {
      margin-top: 30px;
      width: 85%;
    }
    padding: 1rem;
    * {
      margin: 0.5rem 0;
      &:last-child {
        margin-bottom: 0;
      }
    }
    form {
      margin-bottom: 0;
    }
    header {
      padding: 0.5rem 0;
      text-align: center;
      &:first-child {
        padding-top: 0;
        margin-top: 0;
      }
    }
    // TODO: Find a way to handle hashparam form alignment that isn't completely insane
    summary {
      margin: 0;
    }
    details i {
      padding-left: 0.1rem;
      padding-right: 0.8rem; // This is em to match the alignment from picnic, ew
      transition: transform 200ms;
    }
    details[open=""] summary {
      border-bottom: 1px solid #aaa;
      padding-bottom: 0.3rem;
    }
    details[open=""] i {
      transform: rotate(90deg) translate(0.35rem, 0.2rem);
    }
  }
  form {
    display: flex;
    flex-direction: column;
    label {
      display: block;
    }
  }
  input[type=submit] {
    width: 100%;
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
    padding: 0 !important;
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
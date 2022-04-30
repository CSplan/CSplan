<script lang="ts">
  import { goto } from '$app/navigation'
  import user from '$stores/user'
  import { makeSalt } from 'cs-crypto'
  import { onMount } from 'svelte'
  import { RegisterActions } from '$lib/auth-actions'
  import { dev } from '$app/env'
  import HashparamsForm from '$components/auth/hashparams-form.svelte'
  import { FormStates as States } from '$lib/form-states'
  import Spinner from '$components/spinner.svelte'

  // Form data
  let showPassword = false
  let showAdvanced = false
  let message = ''

  // Form state
  let state = States.Loading
  
  // Form elements
  let form: HTMLFormElement
  let email: HTMLInputElement
  let password: HTMLInputElement
  let confirmPassword: HTMLInputElement
  let betaCode: HTMLInputElement

  // Actions
  let actions: RegisterActions

  // If the user is already logged in, redirect them
  // FIXME: Handle automatic navigation in a not stupid way (how its done login-form.svelte)

  async function register(): Promise<void> {
    if (!form.checkValidity()) {
      return
    }

    // Compare password fields
    if (password.value !== confirmPassword.value) {
      confirmPassword.setCustomValidity('Password confirmation isn\'t the same as password')
      return
    } else {
      // Empty string marks the field as valid
      confirmPassword.setCustomValidity('')
    }


    state = States.Saving
    message = ''
    try {
      const authSalt = makeSalt(16)
      await actions.register({
        email: email.value,
        password: password.value,
        betaCode: betaCode.value
      }, authSalt)

      const cryptoSalt = makeSalt(16)
      await actions.generateMasterKeypair(password.value, cryptoSalt)

      await actions.confirmAccount()
    } catch (err) {
      console.error(err)
      user.logout()
      state = States.Errored
      message = err instanceof Error ? err.message : err as string
      return
    }
    goto('/')
  }

  // Mount
  onMount(async () => {
    if ($user.isLoggedIn) {
      goto('/')
    }
    // Initialize argon2 and ed25519 workers
    const wasmRoot = '/argon2'
    const workerScript = dev ? 'worker.js' : 'worker.min.js'

    const argon2 = new Worker(`${wasmRoot}/${workerScript}`)
    const ed25519 = new Worker(`/ed25519/${workerScript}`)

    // Initialize actions class
    actions = new RegisterActions(argon2, ed25519)
    // Set message handler 
    try {
      await actions.loadArgon2({
        wasmRoot,
        simd: true
      })
      await actions.loadED25519({
        wasmPath: '/ed25519/ed25519.wasm'
      })
    } catch (err) {
      state = States.Errored
      message = err instanceof Error ? err.message : err as string
      return
    }
    state = States.Resting
  })
</script>


<div class="card register-form">
  <header>Register</header>
  <form bind:this={form} on:submit|preventDefault={register}>
    <input
      type="email"
      required
      autocomplete="email"
      placeholder="Email"
      bind:this={email}
    />
    <input 
      type={ showPassword ? 'text' : 'password'}
      required
      autocomplete="new-password"
      placeholder="Password"
      bind:this={password}
    />
    <input type={ showPassword ? 'text' : 'password'} required autocomplete="new-password" placeholder="Confirm Password" bind:this={confirmPassword}/>

    <!-- TODO: use better checkboxes than picnic's -->
    <label>
      <input type="checkbox" bind:checked={showPassword}/>
      <span class="checkable">Show Password</span>
    </label>
    <label id="beta-code">
      <header>Beta Access Code</header>
      <input type="text" required minlength=6 maxlength=6 size=6 placeholder="ABCDEF" bind:this={betaCode}/>
    </label>

    <details bind:open={showAdvanced}>
      <summary class="clickable"><i class="fas fa-chevron-right"></i>Advanced</summary>
      {#if actions != null}
        <HashparamsForm bind:actions={actions} on:close={() => showAdvanced = false}/>
      {/if}
    </details>

    {#if !showAdvanced}
      <input type="submit" value="Submit">
    {/if}
    <Spinner {state} {message} vm="0.5rem"/>
  </form>
</div>

<style lang="scss">
  @import './register-form.scss';

  .card {
    @media all and (min-width: 850px) {
      width: 20%;
      margin-top: 10vh;
    }
    @media all and (max-width: 849px) {
      margin-top: 30px;
      width: 85%;
    }
    padding: 1rem;
    form {
      margin-bottom: 0;
    }
    >header:first-child {
      padding: 0.5rem 0;
      padding-top: 0;
      margin-top: 0;
      border-bottom: 1px solid #aaa;
    }
    label#beta-code {
      margin: 0;
      header {
        margin-top: 0.8rem;
        border-top: 1px solid #aaa;
        border-bottom: none;
      }
    }
    // TODO: Find a way to handle hashparam form alignment that isn't completely insane
    details {
      margin: 0;
    }
    summary {
      margin: 0;
      margin-top: 0.8rem;
    }
    details i {
      padding-left: 0.1rem;
      padding-right: 0.8rem; // This is em to match the alignment from picnic, ew
      transition: transform 200ms;
    }
    details summary {
      border-top: 1px solid #aaa;
      padding-top: 0.5rem;
    }
    details[open=""] i {
      transform: rotate(90deg) translate(0.35rem, 0.2rem);
    }
  }
</style>
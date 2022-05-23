<script lang="ts">
  import { LoginActions, AuthConditions } from '$lib/auth-actions'
  import TwoFactorForm from './2fa-form.svelte'
  import { onMount } from 'svelte'
  import user from '$stores/user'
  import { goto, prefetch } from '$app/navigation'
  import { dev } from '$app/env'
  import Spinner from '$components/spinner.svelte'
  import { FormStates as States } from '$lib/form-states'

  // Elements
  let form: HTMLFormElement
  let email: HTMLInputElement
  let password: HTMLInputElement

  // 2FA
  let totp: number

  // Actions
  let actions: LoginActions

  // Form state management
  let state = States.Resting
  let showTOTPForm = false
  let message = ''
  let showPassword = false

  async function login(): Promise<void> {
    if (!form.checkValidity()) {
      return
    }

    state = States.Saving
    message = ''

    try {
      const condition = await actions.authenticate({
        email: email.value,
        password: password.value,
        totp
      })
      switch (condition) {
      case AuthConditions.TOTPRequired:
        // Show TOTP form and wait for submission
        state = States.Resting
        message = ''
        showTOTPForm = true
        return
      }
      await actions.retrieveMasterKeypair(password.value)
      state = States.Saved
      message = 'Successfully logged in'
      await prefetch('/')
    } catch (err) {
      if (err instanceof Error) {
        message = err.message
      } else {
        message = 'An unknown error occured while logging in.'
      }
      state = States.Errored
      return
    }
    goto('/', { replaceState: true })
  }

  function onTOTPSubmit(evt: { detail: number }): void {
    // Resubmit the login form with totp
    totp = evt.detail
    state = States.Saving
    message = ''
    login()
  }

  onMount(async () => {
    if ($user.isLoggedIn) {
      // TODO: Redirects based on login state can be improved with SSR
      goto('/', { replaceState: true })
    }
    // Initialize argon2 and ed25519 web workers
    const workerScript =
      dev ? 'worker.js' : 'worker.min.js'
    const argon2 = new Worker(`/argon2/${workerScript}`)
    const ed25519 = new Worker(`/ed25519/${workerScript}`)

    // Initialize actions with workers
    actions = new LoginActions(argon2, ed25519)
    actions.onMessage = (msg: string) => {
      message = msg
    }
    try {
      await actions.loadArgon2({
        wasmRoot: '/argon2',
        simd: true
      })
      await actions.loadED25519({
        wasmPath: '/ed25519/ed25519.wasm'
      })
    } catch (err) {
      state = States.Errored
      message = err as string || 'unknown error loading web workers and wasm binaries'
    }
  })
</script>

{#if showTOTPForm}
  <TwoFactorForm on:code-submit={onTOTPSubmit} {state} {message}/>
{/if}

<div class="card" class:d-none={showTOTPForm}>
  <header>Log In</header>
  <form bind:this={form} on:submit|preventDefault={login}>
    <input
      bind:this={email}
      type="email"
      required
      autocomplete="email"
      placeholder="Email"
    />
    <input
      bind:this={password}
      type={showPassword ? 'text' : 'password'}
      required
      autocomplete="current-password"
      placeholder="Password"
    />
    <label>
      <input type="checkbox" bind:checked={showPassword} />
      <span class="checkable">Show Password</span>
    </label>
    <input type="submit" value="Submit" disabled={![States.Resting, States.Errored].includes(state)}/>
    <Spinner {state} {message}/>
  </form>
</div>

<style lang="scss">
  @import './login-form.scss';
</style>

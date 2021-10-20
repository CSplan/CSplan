<script lang="ts">
  import { LoginActions, AuthConditions } from './actions'
  import TwoFactorForm from './2fa-form.svelte'
  import { onMount } from 'svelte'
  import user from '$stores/user'
  import { goto } from '$app/navigation'
  import { dev } from '$app/env'

  // Elements
  let form: HTMLFormElement
  let email: HTMLInputElement
  let password: HTMLInputElement

  // 2FA
  let totp: number

  // Actions
  let actions: LoginActions

  // Form state management
  const enum States {
    Resting,
    Submitting,
    TwoFactor,
    Error,
    Success,
  }
  let state = States.Resting
  let stateMsg = ''
  let error = ''
  let showPassword = false

  async function login(): Promise<void> {
    if (!form.checkValidity()) {
      return
    }

    state = States.Submitting

    try {
      const condition = await actions.authenticate({
        email: email.value,
        password: password.value,
        totp
      })
      switch (condition) {
      case AuthConditions.TOTPRequired:
        // Show TOTP form and wait for submission
        state = States.TwoFactor
        return
      }
      await actions.retrieveMasterKeypair(password.value)
    } catch (err) {
      error = err.message
      state = States.Error
      return
    }
    goto('/')
  }

  function onTOTPSubmit(evt: { detail: number }): void {
    // Resubmit the login form with totp
    totp = evt.detail
    state = States.Submitting
    login()
  }

  onMount(async () => {
    if ($user.isLoggedIn) {
      goto('/')
    }
    // Initialize argon2 and ed25519 web workers
    const workerScript =
      dev ? 'worker.js' : 'worker.min.js'
    const argon2 = new Worker(`/argon2/${workerScript}`)
    const ed25519 = new Worker(`/ed25519/${workerScript}`)

    // Initialize actions with workers
    actions = new LoginActions(argon2, ed25519)
    actions.onMessage = (msg: string) => {
      stateMsg = msg
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
      state = States.Error
      error =
        err.message || 'unknown error loading web workers and wasm binaries'
    }
  })
</script>

{#if state === States.TwoFactor}
  <TwoFactorForm on:code-submit={onTOTPSubmit} />
{:else}
  <div class="card">
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
      <input type="submit" value="Submit" />
    </form>

    {#if state === States.Submitting}
      <span class="state">{stateMsg}</span>
    {:else if state === States.Error}
      <span class="error">{error}</span>
    {/if}
  </div>
{/if}

<style lang="scss">
  .card {
    width: 20%;
    padding: 1rem;
    margin: 0;
    * {
      margin: 0.5rem 0;
      &:last-child {
        margin-bottom: 0;
      }
    }
    header {
      padding: 0;
      padding-bottom: 0.5rem;
      text-align: center;
    }
    form {
      display: flex;
      flex-direction: column;
      margin-bottom: 0;
    }
  }

  /* Footer styles */
  span.state {
    text-align: left;
    max-width: 100%;
  }
  span.error {
    font-family: monospace;
    color: rgb(199, 39, 39);
    font-weight: 500;
    border: 1px solid #aaa;
    border-radius: 5px;
    padding: 0.3rem 0.4rem;
  }
</style>

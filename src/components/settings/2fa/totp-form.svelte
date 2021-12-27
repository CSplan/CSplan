<script lang="ts">
  import { HTTPerror, route, FormStates as States, formatError } from '$lib'
  import { onMount, tick } from 'svelte'
  import { slide } from 'svelte/transition'
  import { LoginActions, TOTPActions, UpgradeActions } from '$lib/auth-actions'
  import userStore from '$stores/user'
  import SecretModal from '$components/modals/totp-secret-modal.svelte'
  import Spinner from '$components/spinner.svelte'

  // Form state
  let enabled = false
  let editing = false
  let state = States.Resting
  let message = ''

  // Authentication actions
  let actions: LoginActions

  // Password input, stored for automatic focusing
  let passwordInput: HTMLInputElement
  let qrcodeSVG: SVGSVGElement
  // User password, needed to upgrade to auth level 2
  let password: string
  let totpInfo: TOTPinfo = {
    secret: '',
    backupCodes: []
  }

  let showSecretModal = false

  async function toggleEditing(): Promise<void> {
    editing = !editing
    if (editing) {
      await tick()
      passwordInput.focus()
    }
  }


  // #region Form Submission
  async function submit(): Promise<void> {
    state = States.Saving
    message = ''

    try {
      // Upgrade to level 2 auth
      if (actions == null) {
        actions = new LoginActions(new Worker('/argon2/worker.js'), new Worker('/ed25519/worker.js'))
        await actions.loadArgon2({ wasmRoot: '/argon2', simd: true })
        await actions.loadED25519({ wasmPath: '/ed25519/ed25519.wasm' })
      }
      await UpgradeActions.passwordUpgrade(actions, password)

      if (enabled) {
        await disableTOTP()
      } else {
        await enableTOTP()
      }
    } catch (err) {
      state = States.Errored
      message = formatError(err instanceof Error ? err.message : (err as string).toString())
    } finally {
      // Downgrade auth
      await UpgradeActions.downgrade()
    }
  }


  async function enableTOTP(): Promise<void> {
    // Enable TOTP and display the result
    totpInfo = await TOTPActions.enable()
    state = States.Resting
    showSecretModal = true
    const uri = TOTPActions.URI('CSplan', $userStore.user.email, totpInfo.secret)
    // Wait for the modal to render before writing to the svg it contains
    await tick()
    TOTPActions.qr2svg(TOTPActions.qrCode(uri), qrcodeSVG, 0, 'white', 'black')
  }

  async function disableTOTP(): Promise<void> {
    // Disable TOTP
    await TOTPActions.disable()
    state = States.Saved
    message = 'TOTP was successfully disabled'
    await tick()
    setTimeout(() => {
      state = States.Resting
      message = ''
    }, 500)
    enabled = false
  }
  // #endregion

  function totpEnabled(): void {
    showSecretModal = false
    editing = false
    enabled = true
  }

  onMount(async () => {
    const res = await fetch(route('/totp/status'))
    if (res.status !== 200) {
      throw new Error(await HTTPerror(res, 'Failed to retrieve TOTP status'))
    }
    const status: TOTPStatus = await res.json()
    enabled = status.enabled
  })
</script>

<SecretModal bind:svg={qrcodeSVG} show={showSecretModal} info={totpInfo} on:success={totpEnabled}></SecretModal>

<form class="totp-form" on:submit|preventDefault={submit}>
  <p class="totp-info">
    Time based one time passwords allow you to require a second form of authentication for improved log-in security. Enabling this feature requires a separate application capable of manging TOTP codes such as <a href="https://apps.apple.com/us/app/raivo-otp/id1459042137">Ravio OTP</a>, <a href="https://getaegis.app/">Aegis Authenticator</a>, <a href="https://authy.com/">Authy</a>, or <a href="https://keepassxc.org/">KeepassXC</a>.
    <i class="fas fa-info-circle endorsement-tooltip" title="CSplan does not endorse nor test any of the examples provided, users should verify the reliability and security of any TOTP application before trusting it to manage codes."/>
  </p>
  <hr>

  <div class="totp-indicator" class:enabled>
    <i class="{enabled ? 'fas fa-check-circle' : 'fas fa-minus-circle'} totp-indicator"></i>
    <span>TOTP is {enabled ? 'enabled' : 'disabled'}</span>
  </div>
  {#if !editing}
    {#if enabled}
      <input class="totp-button disable-button" type="button" value="Disable TOTP" on:click={toggleEditing}>
    {:else}
      <input class="totp-button enable-button" type="button" value="Enable TOTP" on:click={toggleEditing}>
    {/if}
  {/if}

  {#if editing}
    <div class="editable" in:slide={{ duration: 50 }}>
      <label>
        Password
        <input type="password" placeholder="Enter your password to {enabled ? 'disable' : 'enable'} TOTP" bind:this={passwordInput} bind:value={password} required>
      </label>

      <div class="bottom-buttons">
        <input type="button" value="Cancel" class="cancel-button" on:click={toggleEditing}>
        <input type="submit" value="Confirm" class="submit-button">
      </div>

      <Spinner {state} {message} size="2rem"/>
    </div>
  {/if}
</form>

<style lang="scss">
  form.totp-form {
    display: flex;
    flex-direction: column;
  }
  p.totp-info {
    margin-top: 0 !important;
  }
  i.endorsement-tooltip {
    font-size: 1rem;
    &:hover {
      opacity: 50%;
    }
  }
  div.totp-indicator {
    display: flex;
    flex-direction: row;
    align-items: center;

    font-size: 110%;
    color: rgb(87, 87, 87);
    i {
      font-size: 150%;
      margin-right: 0.5rem;
    }
    &.enabled {
      color: $success-green;
    }
    margin-bottom: 0.5rem;
  }

  input.enable-button {
    background-color: $bold-blue;
    color: white;
  }
  input.disable-button {
    background-color: $danger-red;
    color: white;
  }
  input.totp-button {
    width: max-content;
    align-self: center;
  }

  hr {
    width: 100%;
    color: #aaa;
    border-top: 1px;
  }

  div.bottom-buttons {
    display: grid;
    grid-template-columns: max-content 8fr 2fr;
  }
  input.cancel-button {
    grid-column: 1;
    background-color: $danger-red;
    color: white;
  }
  input.submit-button {
    grid-column: 3;
  }

</style>
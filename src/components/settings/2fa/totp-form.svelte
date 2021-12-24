<script lang="ts">
  import { HTTPerror, route } from '$lib'
  import { onMount, tick } from 'svelte'
  import { slide } from 'svelte/transition'
  import { LoginActions, TOTPActions, UpgradeActions } from '$lib/auth-actions'
  import userStore from '$stores/user'
  import Modal from '$components/modals/modal.svelte'

  let enabled = false
  let editing = false

  // Authentication actions
  let actions: LoginActions

  // Password input, stored for automatic focusing
  let passwordInput: HTMLInputElement
  let qrSVG: SVGSVGElement
  // User password, needed to upgrade to auth level 2
  let password: string
  let totpSecret = ''

  let showSecretModal = false

  async function toggleEditing(): Promise<void> {
    editing = !editing
    if (editing) {
      await tick()
      passwordInput.focus()
    }
  }

  async function submit(): Promise<void> {
    if (enabled) {

    } else {
      await enableTOTP()
    }
  }


  async function enableTOTP(): Promise<void> {
    /*
    // Upgrade to level 2 auth
    if (actions == null) {
      actions = new LoginActions(new Worker('/argon2/worker.js'), new Worker('/ed25519/worker.js'))
      await actions.loadArgon2({ wasmRoot: '/argon2', simd: true })
      await actions.loadED25519({ wasmPath: '/ed25519/ed25519.wasm' })
    }
    await UpgradeActions.passwordUpgrade(actions, password)
    */

    // Enable TOTP and display the result
    try {
      //const totpInfo = await TOTPActions.enable()
      totpSecret = 'YMCQK2SHVGNG6ZF5IVNZSNDSWDKYAWPZ'
      const uri = TOTPActions.URI('CSplan', $userStore.user.email, 'YMCQK2SHVGNG6ZF5IVNZSNDSWDKYAWPZ') // test value
      showSecretModal = true
      await tick()
      TOTPActions.qr2svg(TOTPActions.qrCode(uri), qrSVG, 0, '#fff', 'var(--background-dark)')
    } catch (err) {
      // Downgrade auth
      //await UpgradeActions.downgrade()
      throw err
    }

  }

  async function disableTOTP(): Promise<void> {
  }

  onMount(async () => {
    const res = await fetch(route('/totp/status'))
    if (res.status !== 200) {
      throw new Error(await HTTPerror(res, 'Failed to retrieve TOTP status'))
    }
    const status: TOTPStatus = await res.json()
    enabled = status.enabled
    await enableTOTP()
  })
</script>

<Modal show={showSecretModal} flex={true} lock={true}>
  <article class="totp-authinfo">
    <ol>
      <li>
        <svg bind:this={qrSVG}></svg>
        <span><b>Option 1</b>: Scan this QR code with a TOTP authenticator.</span>
        <pre>{totpSecret}</pre>
        <span><b>Option 2:</b> Manually enter your secret into a TOTP authenticator.</span>
      </li>
      <li></li>
    </ol>

    <label>
      <header>Enter a TOTP code to verify that your authenticator is properly set up</header>
      <input type="text" placeholder="{'0'.repeat(6)}">
    </label>
  </article> 
</Modal>

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

  article.totp-authinfo {
    margin-top: 20vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    align-self: center;
    background: white;
    padding: 1.5rem 2rem;
    max-width: 550px;
    ol.steps li {
      display: flex;
      flex-direction: column;
      align-items: center;
      list-style-position: outside;
    }
    svg {
      max-width: 300px;
    }
    span {
      margin: 1rem 0;
    }
    pre {
      margin: 0;
      margin-top: 1rem;
    }
  }
</style>
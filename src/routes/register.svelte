<script lang="ts">
  import { goto } from '@sapper/app'
  import navbar from '../components/navbar.svelte'
  import user from '../stores/user'
  import { getDB } from '../db'
  import { rsa, makeSalt, encoding } from 'cs-crypto'
  const { generateKeypair, wrapPrivateKey } = rsa
  const { ABencode } = encoding

  // Type definitions
  interface LoginResponse {
    CSRFtoken: string
    id: string
    verified: boolean
  }
  interface ErrorResponse {
    title: string
    message: string
    status: number
  }

  // Form data
  let fields = {
    email: '',
    password: '',
    confirmPassword: ''
  }
  let showPassword = false
  let error = ''
  let stateMsg = ''

  // Form state
  enum states {
    resting,
    submitting,
    error,
    success
  }
  let state = states.resting

  function updateField(e: Event & {target: HTMLInputElement }) {
    const field = e.target.getAttribute('data-field')
    fields[field] = e.target.value
  }

  async function register() {
    const form = document.querySelector('#registerForm') as HTMLFormElement
    if (!form.checkValidity()) {
      return
    }
    state = states.submitting
    stateMsg = 'Creating your Account'
    
    // Register step with API
    try {
      const res = await fetch('http://localhost:3000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(fields)
      })
      if (res.status !== 201) {
        const resBody: ErrorResponse = await res.json()
        throw new Error(resBody.message || 'Unknown error')
      }
    } catch (err) {
      state = states.error
      error = err.message
      return
    }

    stateMsg = 'Authenticating with Backend'
    try {
      const res = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json' 
        },
        credentials: 'include',
        body: JSON.stringify(fields)
      })
      const resBody: LoginResponse|ErrorResponse = await res.json()
      if (res.status !== 200) {
        const errBody = resBody as ErrorResponse
        throw new Error(errBody.message || "Unknown error")
      }
      const body = resBody as LoginResponse
      localStorage.setItem('CSRF-Token', body.CSRFtoken)
      user.login({ id: body.id, email: fields.email })
    } catch (err) {
      state = states.error
      error = err.message
      return
    }

    stateMsg = 'Generating your master keypair'
    try {
      const { privateKey, publicKey } = await generateKeypair(2048)
      const PBKDF2salt = makeSalt(16)
      console.log(privateKey)
      const encryptedPrivateKey = (await wrapPrivateKey(privateKey, fields.password, PBKDF2salt, 'AES-GCM')).split(':')[1]
      // TODO: add export key functionality to cs-crypto
      const encodedPublicKey = ABencode(await crypto.subtle.exportKey(
        'spki',
        publicKey
      ))
      const res = await fetch('http://localhost:3000/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': localStorage.getItem('CSRF-Token')
        },
        credentials: 'include',
        body: JSON.stringify({ publicKey: encodedPublicKey, privateKey: encryptedPrivateKey, PBKDF2salt: ABencode(PBKDF2salt) })
      })
      if (res.status !== 204) {
        const resBody = await res.json()
        throw new Error(resBody.message || "Unknown error")
      }

      // Add to IDB
      const db = await getDB()
      const store = db.transaction('keys', 'readwrite').objectStore('keys')
      const req = store.add({
        id: $user.user.id,
        publicKey,
        privateKey
      })
      req.addEventListener('success', () => {
        state = states.success
        goto('/')
      })
    }
    catch (err) {
      state = states.error
      error = err instanceof Error ? err.message : err
      return
    }
  }
</script>

<svelte:component this={navbar}></svelte:component>
<main>
  <div class="card">
    <header>Register</header>
    <form id="registerForm" on:submit|preventDefault={register}>
      <input data-field="email" type="email" required autocomplete="username" placeholder="Email" on:input={updateField}>
      <input data-field="password" type={ showPassword ? 'text' : 'password'} required autocomplete="new-password" placeholder="Password" on:input={updateField}>
      <input data-field="confirmPassword" type={ showPassword ? 'text' : 'password'} required autocomplete="new-password" placeholder="Confirm Password" on:input={updateField}>
      <label>
        <input type="checkbox" bind:checked={showPassword}>
        <span class="checkable">Show Password</span>
      </label>
      <input type="submit" disabled={fields.password !== fields.confirmPassword}>
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
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .card {
    padding: 1rem;
    margin-top: 12rem;
    max-width: 300px;
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
    color: var(--bold-blue)
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
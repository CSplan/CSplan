<script>
  import { goto } from '@sapper/app'
  import navbar from '../components/navbar.svelte'
  import user from '../stores/user'
  import { route } from '../route'
  import { rsa, ABdecode } from 'cs-crypto'
  const { unwrapPrivateKey, importPublicKey } = rsa
  import { getDB, addToStore } from '../db'
  $: $user.isLoggedIn && goto('/')

  // Form state management
  const states = {
    resting: 0,
    submitting: 1,
    error: 2,
    success: 3
  }
  let state = states.resting
  let error = ''

  const fields = {
    email: '',
    password: ''
  }
  let showPassword = false

  function updateField(e) {
    const field = e.target.getAttribute('data-field')
    fields[field] = e.target.value
  }

  async function login() {
    const form = document.querySelector('#loginForm')
    if (!form.checkValidity()) {
      return
    }

    try {
      const res = await fetch(route('/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(fields)
      })
      const body = await res.json()
      if (res.status !== 200) {
        throw new Error(body.message || `Unknown error (status ${res.status}`)
      }

      // Update application state
      localStorage.setItem('CSRF-Token', body.CSRFtoken)
      user.login({ id: body.id, email: fields.email })
    } catch (err) {
      state = states.error
      error = err.message
      return
    }

    // Retrieve and decrypt keys
    try {
      const res = await fetch(route('/keys'), {
        method: 'GET',
        headers: {
          'CSRF-Token': localStorage.getItem('CSRF-Token')
        },
        credentials: 'include'
      })
      const body = await res.json()
      
      // Import the user's master keypair
      const publicKey = await importPublicKey(body.publicKey)
      const PBKDF2salt = ABdecode(body.PBKDF2salt)
      const privateKey = await unwrapPrivateKey('AES-GCM:' + body.privateKey, fields.password, PBKDF2salt)

      await getDB()
      await addToStore('keys', {
        id: $user.user.id,
        publicKey,
        privateKey
      })
      goto('/') // TODO: redirect to user dashboard page
    } catch (err) {
      state = states.error
      error = err.message
      return
    }
  }
</script>

<svelte:component this={navbar}></svelte:component>
<main>
  <div class="card">
    <header>Log In</header>
    <form id="loginForm" on:submit|preventDefault={login}>
      <input data-field="email" type="email" required autocomplete="email" placeholder="Email" on:input={updateField}>
      <input data-field="password" type={showPassword ? 'text' : 'password'} required autocomplete="current-password" placeholder="Password" on:input={updateField}>
      <label>
        <input type="checkbox" bind:checked={showPassword}>
        <span class="checkable">Show Password</span>
      </label>
      <input type="submit">
    </form>
    <footer>
    {#if state === states.error}
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
    justify-content: center;
  }
  .card {
    margin-top: 20vh;
    max-width: 300px;
    padding: 1rem;
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
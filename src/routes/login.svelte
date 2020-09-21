<script>
  import { goto } from '@sapper/app'
  import navbar from '../components/navbar.svelte'
  import user from '../stores/user'
  import { route } from '../route'
  import { rsa, ABdecode, ABencode, aes } from 'cs-crypto'
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

      // Request a challenge for the user
      let res = await fetch(route('/challenge?action=request'), {
        method: 'POST',
        body: JSON.stringify({
          email: fields.email
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      /** @type {Challenge} */
      let body = await res.json()
      if (res.status !== 200) {
        throw new Error(body.message || 'Failed to request an authentication challenge.')
      }
      // Run PBKDF2 using the user's password and salt
      const authKey = await aes.deriveKey('AES-GCM', fields.password, ABdecode(body.salt))
      // Slice iv and encrypted challenge data
      const [iv, encrypted] = [ABdecode(body.data).slice(0, 12), ABdecode(body.data).slice(12)]
      // Decrypt the challenge data (and encode for transport)
      const decrypted = ABencode(await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv
        },
        authKey,
        encrypted
      ).catch((err) => {
        throw new Error('Invalid password.') // Show decryption errors as 'invalid password'
      }))
      // Submit the challenge
      res = await fetch(route(`/challenge/${body.id}?action=submit`), {
        method: 'POST',
        body: JSON.stringify({
          data: decrypted
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      body = await res.json()
      if (res.status !== 200) {
        throw new Error(body.message || 'Failed to submit challenge.')
      }
      // Store the CSRF token in localstorage
      localStorage.setItem('CSRF-Token', body.CSRFtoken)
      user.login({
        email: fields.email,
        id: body.id
      })

      // Retrieve and decrypt the user's master RSA keypair
      res = await fetch(route('/keys'), {
        method: 'GET',
        headers: {
          'CSRF-Token': localStorage.getItem('CSRF-Token')
        }
      })
      body = await res.json()
      if (res.status !== 200) {
        throw new Error(body.message || 'Failed to retrieve master RSA keypair.')
      }
      // Decrypt the user's private key
      const privateKey = await rsa.unwrapPrivateKey('AES-GCM:'+body.privateKey, fields.password, ABdecode(body.PBKDF2salt))
      const publicKey = await rsa.importPublicKey(body.publicKey)
      // Store in IDB
      addToStore('keys', {
        id: $user.id,
        publicKey,
        privateKey
      })

      // Go home an authenticated manperson
      goto('/')
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
<script>
  import { goto } from '@sapper/app'
  import navbar from '../components/navbar.svelte'
  import user from '../stores/user'
  import { route } from '../route'
  import { rsa, ABdecode, ABencode, aes } from 'cs-crypto'
  import { addToStore } from '../db'
  import { onMount } from 'svelte'

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
    const form = document.querySelector('#loginForm')
    if (!form.checkValidity()) {
      return
    }

    const email = form.querySelector('#email').value
    const password = form.querySelector('#password').value
    state = states.submitting
  
    try {
      // Request a challenge for the user
      let res = await fetch(route('/challenge?action=request'), {
        method: 'POST',
        body: JSON.stringify({
          email
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
      const authKey = await aes.deriveKey('AES-GCM', password, ABdecode(body.salt))
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
      ).catch(() => {
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
        email,
        id: body.id
      })

      // Retrieve and decrypt the user's master RSA keypair
      stateMsg = 'Retrieving master keypair'
      res = await fetch(route('/keys'), {
        method: 'GET',
        headers: {
          'CSRF-Token': localStorage.getItem('CSRF-Token')
        }
      })
      body = await res.json()
      // TODO: implement key recovery
      if (res.status === 404) {
        if (!confirm('Missing master keypair! This is a recoverable error but all of your data will be wiped. Do you wish to proceed? (the alternative means of recovery would be to manually PATCH your keys using curl if you have them backed up.')) {
          //
        }
      } else if (res.status !== 200) {
        throw new Error(body.message || 'Failed to retrieve master RSA keypair.')
      }
      // Decrypt the user's private key
      const privateKey = await rsa.unwrapPrivateKey('AES-GCM:'+body.privateKey, password, ABdecode(body.PBKDF2salt))
      const publicKey = await rsa.importPublicKey(body.publicKey)
      // Store in IDB
      await addToStore('keys', {
        id: $user.user.id,
        publicKey,
        privateKey
      })

      // Redirect to what should be the user's dashboard
    } catch (err) {
      error = err.message
      state = states.error
      return
    }
  }

  onMount(() => {
    if ($user.isLoggedIn) {
      goto('/')
    }
  })
</script>

<svelte:component this={navbar}></svelte:component>
<main>
  <div class="card">
    <header>Log In</header>
    <form id="loginForm" on:submit|preventDefault={login}>
      <input id="email" type="email" required autocomplete="email" placeholder="Email">
      <input id="password" type={showPassword ? 'text' : 'password'} required autocomplete="current-password" placeholder="Password">
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
</main>

<style>
  main {
    margin-top: 20vh;
    display: flex;
    flex-direction: row;
    align-items: stretch;
    justify-content: center;
  }
  main>.card {
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
  #loginForm {
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
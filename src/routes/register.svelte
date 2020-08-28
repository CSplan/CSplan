<script>
  import '../../types/auth'
  import { goto } from '@sapper/app'
  import navbar from '../components/navbar.svelte'
  import user from '../stores/user'
  import { route } from '../route'
  import { addToStore } from '../db'
  import { rsa, aes, makeSalt, ABencode, ABdecode } from 'cs-crypto'

  // If the user is already logged in, redirect them
  $: $user.isLoggedIn && goto('/')

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
  const states = {
    resting: 0,
    submitting: 1,
    error: 2,
    success: 3
  }
  let state = states.resting

  function updateField(e) {
    const field = e.target.getAttribute('data-field')
    fields[field] = e.target.value
  }

  async function register() {
    const form = document.querySelector('#registerForm')
    if (!form.checkValidity()) {
      return
    }
    // Compare password fields
    const confirmPasswdField = document.querySelector('[data-field="confirmPassword"]')
    if (fields.password !== fields.confirmPassword) {
      confirmPasswdField.setCustomValidity('Password confirmation isn\'t the same as password')
      return
    } else {
      // Empty string marks the field as valid
      confirmPasswdField.setCustomValidity('')
    }

    state = states.submitting

    stateMsg = 'Generating your Authentication Key'
    try {
      const salt = makeSalt(16)
      const authKey = await deriveKey('AES-GCM', fields.password, salt, true)
      const exportedKey = await exportKey(authKey, salt)
      await fetch(route('/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application-json'
        },
        credentials: 'include',
        body: JSON.stringify({
          email: fields.email,
          key: exportedKey
        })
      })
      let res = await fetch(route('/challenge?action=request'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: fields.email
        })
      })
      /** @type {Challenge} */
      const challenge = await res.json()
      // Decrypt the challenge data
      const solved = await decrypt(challenge.data, authKey)
      res = await fetch(route(`/challenge/${challenge.id}?action=submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          data: solved
        })
      }))
      const tokens = await res.json()
      console.log(tokens)
      return
    } catch (err) {
      state = states.error
      error = err instanceof Error ? err.message : err
      return
    }

    stateMsg = 'Generating your master keypair'
    try {
      const { privateKey, publicKey } = await generateKeypair(2048)
      const PBKDF2salt = makeSalt(16)
      const encodedSalt = ABencode(PBKDF2salt)
      const encodedPublicKey = await exportPublicKey(publicKey)
      
      stateMsg = 'Creating your account'
      let res = await fetch(route('/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: fields.email,
          keys: {
            PBKDF2salt: encodedSalt,
            publicKey: encodedPublicKey
          }
        })
      })
      let body = await res.json()
      if (res.status !== 201) {
        throw new Error(body.message || 'Failed to register.')
      }

      // Add to IDB
      stateMsg = 'Storing your master keypair'
      await addToStore('keys', {
        id: body.id,
        publicKey,
        privateKey
      })

      // Request a challenge from the API
      res = await fetch(route('/challenge?action=request'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: fields.email
        })
      })
      body = await res.json()

      // Solve the challenge
      const decoded = ABdecode(body.data)
      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'RSA-OAEP'
        },
        privateKey,
        decoded
      )
      console.log(decrypted)
    } catch (err) {
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
      <input data-field="email" type="email" required autocomplete="email" placeholder="Email" on:input={updateField}>
      <input data-field="password" type={ showPassword ? 'text' : 'password'} required autocomplete="new-password" placeholder="Password" on:input={updateField}>
      <input data-field="confirmPassword" type={ showPassword ? 'text' : 'password'} required autocomplete="new-password" placeholder="Confirm Password" on:input={updateField}>
      <label>
        <input type="checkbox" bind:checked={showPassword}>
        <span class="checkable">Show Password</span>
      </label>
      <input type="submit">
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
<script>
  import { goto } from '@sapper/app'
  import navbar from '../components/navbar.svelte'
  import user from '../stores/user'
  import { getDB } from '../db'
  import { rsa, makeSalt, encoding } from 'cs-crypto'
  const { generateKeypair, wrapPrivateKey, exportPublicKey } = rsa
  const { ABencode } = encoding

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
        const body = await res.json()
        throw new Error(body.message || `Unknown error (status ${res.status}`)
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
      const resBody = await res.json()
      if (res.status !== 200) {
        throw new Error(resBody.message || 'Unknown error')
      }
      localStorage.setItem('CSRF-Token', resBody.CSRFtoken)
      user.login({ id: resBody.id, email: fields.email })
    } catch (err) {
      state = states.error
      error = err.message
      return
    }

    stateMsg = 'Generating your master keypair'
    try {
      const { privateKey, publicKey } = await generateKeypair(2048)
      const PBKDF2salt = makeSalt(16)
      const encryptedPrivateKey = (await wrapPrivateKey(privateKey, fields.password, PBKDF2salt, 'AES-GCM')).split(':')[1]
      const encodedPublicKey = await exportPublicKey(publicKey)
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
        throw new Error(resBody.message || 'Unknown error')
      }

      // Add to IDB
      const db = await getDB()
      const store = db.transaction('keys', 'readwrite').objectStore('keys')
      const req = store.add({
        id: $user.user.id,
        publicKey,
        privateKey
      })
      req.onsuccess = () => {
        state = states.success
        goto('/')
      }
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
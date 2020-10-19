<script>
  import '../../types/auth'
  import { goto } from '@sapper/app'
  import navbar from '../components/navbar.svelte'
  import user from '../stores/user'
  import { route } from '../route'
  import { addToStore } from '../db'
  import { ABdecode, ABencode, aes, makeSalt, rsa } from 'cs-crypto'


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

    // If the user is already logged in, redirect them
    $: $user.isLoggedIn && state === states.resting && goto('/')


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

    // Authenticate
    try {
      stateMsg = 'Generating your Authentication Key'
      const salt = makeSalt(16)
      const authKey = await aes.deriveKey('AES-GCM', fields.password, salt, true)
      const exportedKey = await aes.exportKey(authKey, salt)
      stateMsg = 'Creating your account'
      let res = await fetch(route('/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          email: fields.email,
          key: exportedKey
        })
      })
      let body = await res.json()
      if (res.status !== 201) {
        throw new Error(body.message || 'Failed to register your account.')
      }
      const userid = body.id

      stateMsg = 'Logging in'
      res = await fetch(route('/challenge?action=request'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: fields.email
        })
      })
      /** @type {Challenge} */
      body = await res.json()
      const [iv, encrypted] = [ABdecode(body.data).slice(0, 12), ABdecode(body.data).slice(12)]
      // Decrypt the challenge data
      const solved = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv
        },
        authKey,
        encrypted
      )

      res = await fetch(route(`/challenge/${body.id}?action=submit`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          data: ABencode(solved)
        })
      })
			const { CSRFtoken } = await res.json()
			
			// Store user info and CSRF token
      user.login({
        email: fields.email,
        id: userid
			})
      localStorage.setItem('CSRF-Token', CSRFtoken)
      
      // Generate the user's master RSA keypair
      stateMsg = 'Generating your master RSA keypair'
      const { publicKey, privateKey } = await rsa.generateKeypair(2048)
      const PBKDF2salt = makeSalt(16)
      const encryptedPrivateKey = (await rsa.wrapPrivateKey(privateKey, fields.password, PBKDF2salt, 'AES-GCM')).split(':')[1]
      // Store them locally
      await addToStore('keys', {
        id: userid,
        publicKey,
        privateKey
      })
      // And store them on the API
      res = await fetch(route('/keys'), {
        method: 'POST',
        body: JSON.stringify({
          publicKey: await rsa.exportPublicKey(publicKey),
          privateKey: encryptedPrivateKey,
          PBKDF2salt: ABencode(PBKDF2salt)
        }),
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': localStorage.getItem('CSRF-Token')
        }
      })
      if (res.status !== 201) {
        const body = await res.json()
        throw new Error(body.message || 'Failed to store master RSA keypair.')
      }
    } catch (err) {
      user.logout()
      state = states.error
      error = err instanceof Error ? err.message : err
    }
    goto('/')
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
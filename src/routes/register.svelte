<script lang="ts">
  import navbar from '../components/navbar.svelte'
  import user from '../stores/user'
  import { rsa, aes, makeSalt } from 'cs-crypto'
  let fields = {
    email: '',
    password: '',
    confirmPassword: ''
  }
  let showPassword = false
  let error = ''
  let stateMsg = ''

  // Form states
  enum states {
    resting,
    submitting,
    error,
  }
  let state = states.resting

  function updateField(e: Event & {target: HTMLInputElement }) {
    const field = e.target.getAttribute('data-field')
    fields[field] = e.target.value
  }

  async function register() {
    const form = document.querySelector('form')
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
    const resBody = await res.json()
    if (res.status !== 201) {
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
        body: JSON.stringify(fields)
      })
      const resBody = await res.json()
      localStorage.setItem('CSRF-Token', resBody.CSRFtoken)
      if (res.status !== 200) {
        throw new Error(resBody.message || "Unknown error")
      }
      user.login({ ...fields })
    } catch (err) {
      state = states.error
      error = err.message
      return
    }

    stateMsg = 'Generating your master keypair'
    try {
      const { privateKey, publicKey } = await rsa.generateKeypair(2048)
      const PBKDF2salt = await makeSalt(16)
      const encryptedPrivateKey = await rsa.wrapPrivateKey(privateKey, fields.password, PBKDF2salt, 'AES-GCM')
      const res = await fetch('http://localhost:3000/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': localStorage.getItem('CSRF-Token')
        },
        body: JSON.stringify({ publicKey, privateKey: encryptedPrivateKey })
      })
      if (res.status !== 201) {
        const resBody = await res.json()
        throw new Error(resBody.message || "Unknown error")
      }
      // Store key in IDB using a web worker
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
    <!-- Manually preventing the default submit event is required to retain HTML5 email validation -->
    <form on:submit|preventDefault={register}>
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

<pre>
showPassword: {showPassword}
fields: {JSON.stringify(fields, null, 2)}
user store: {JSON.stringify($user, null, 2)}
</pre>

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
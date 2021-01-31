<script lang="ts" context="module">
  export type Argon2HashParams = {
    type: 'argon2i',
    timeCost: number,
    memoryCost: number,
    threads: number,
    saltLen: number
  }
  export type Challenge = {
    id: string,
    data: string,
    salt: string,
    hashParams: Argon2HashParams
  }
  export type SolvedChallenge = {
    data: string
  }
  export type ErrorResponse = {
    title: string,
    message: string,
    status: number
  }
  export type ChallengeResponse = {
    id: string,
    CSRFtoken: string
  }
</script>

<script lang="ts">
  import { goto } from '@sapper/app'
  import navbar from '../components/navbar.svelte'
  import user from '../stores/user'
  import { route } from '../route'
  import { addToStore } from '../db'
  import { ABconcat, ABdecode, ABencode, aes, Algorithms, makeSalt, rsa } from 'cs-crypto'
  import { onDestroy, onMount } from 'svelte'
  import * as listen from '@very-amused/argon2-wasm/lib/listen'
  import { Argon2_Actions, Argon2_ErrorCodes } from '@very-amused/argon2-wasm/lib/argon2'
  import type { Argon2_Request, Argon2_Response } from '@very-amused/argon2-wasm/lib/argon2'

  type RegisterResponse = {
    id: string,
    hashParams: Argon2HashParams
  }
  type RegisterRequest = {
    email: string,
    key: string,
    hashParams: Argon2HashParams
  }

  // Form data
  let showPassword = false
  let error = ''
  let stateMsg = ''

  // Form state
  const enum states {
    resting,
    submitting,
    error,
    success
  }
  let state = states.resting
  
  // Form elements
  let form: HTMLFormElement
  let email: HTMLInputElement
  let password: HTMLInputElement
  let confirmPassword: HTMLInputElement

  // Web Worker
  let worker: Worker
  const workerID = 0


  // If the user is already logged in, redirect them
  $: $user.isLoggedIn && state === states.resting && goto('/')

  async function register() {
    // Compare password fields
    const confirmPasswdField = document.querySelector('[data-field="confirmPassword"]')
    if (password.value !== confirmPassword.value) {
      confirmPassword.setCustomValidity('Password confirmation isn\'t the same as password')
      return
    } else {
      // Empty string marks the field as valid
      confirmPassword.setCustomValidity('')
    }

    if (!form.checkValidity()) {
      return
    }

    state = states.submitting

    // Authenticate
    try {
      stateMsg = 'Generating your Authentication Key'
      const salt = makeSalt(16)
      // Derive a key using argon2
      worker.postMessage(<Argon2_Request>{
        action: Argon2_Actions.Hash2i,
        body: {
          timeCost: 5,
          memoryCost: 128 * 1024,
          password: password.value,
          salt,
          hashLen: 32
        }
      })
      const message = await listen.nextMessage(worker, workerID)
      const keyMaterial = <Uint8Array>message.body
      if (message.code !== Argon2_ErrorCodes.ARGON2_OK) {
        throw new Error('Argon2 error.')
      }
      const authKey = await crypto.subtle.importKey(
        "raw",
        keyMaterial, 
        Algorithms.AES_GCM,
        false,
        ['wrapKey', 'unwrapKey', 'decrypt']
      )

      stateMsg = 'Creating your account'
      // Prepare register body
      const registerBody: RegisterRequest = {
        email: email.value,
        key: ABencode(ABconcat(salt, keyMaterial)),
        hashParams: {
          type: 'argon2i',
          timeCost: 1,
          memoryCost: 128 * 1024,
          threads: 1,
          saltLen: 16
        }
      }
      let res = await fetch(route('/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(registerBody)
      })
      let registerResponse: RegisterResponse = await res.json()
      if (res.status !== 201) {
        const err = <ErrorResponse>(<any>registerResponse)
        throw new Error(err.message || 'Failed to register your account.')
      }
      const userid: string = registerResponse.id

      stateMsg = 'Logging in'
      res = await fetch(route('/challenge?action=request'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.value
        })
      })
      const challenge: Challenge = await res.json()
      const rawChallenge = ABdecode(challenge.data)
      const [iv, encrypted] = [
        rawChallenge.slice(0, 12),
        rawChallenge.slice(12)
      ]
      // Decrypt the challenge data
      const solved = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv
        },
        authKey,
        encrypted
      )

      // Submit the solved challenge
      const solvedChallenge: SolvedChallenge = {
        data: ABencode(solved)
      }
      res = await fetch(route(`/challenge/${challenge.id}?action=submit`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(solvedChallenge)
      })
      const { CSRFtoken } = await res.json()
			
      // Store user info and CSRF token
      user.login({
        email: email.value,
        id: userid
      })
      localStorage.setItem('CSRF-Token', CSRFtoken)
      
      // Generate the user's master RSA keypair
      stateMsg = 'Generating your master RSA keypair'
      const { publicKey, privateKey } = await rsa.generateKeypair(2048)
      const PBKDF2salt = makeSalt(16)
      const encryptedPrivateKey = (await rsa.wrapPrivateKey(privateKey, password.value, PBKDF2salt, 'AES-GCM')).split(':')[1]

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
          'CSRF-Token': <string>localStorage.getItem('CSRF-Token')
        }
      })
      if (res.status !== 201) {
        const body = await res.json()
        throw new Error(body.message || 'Failed to store master RSA keypair.')
      }
    } catch (err) {
      console.error(err)
      console.log(stateMsg)
      user.logout()
      state = states.error
      error = err instanceof Error ? err.message : err
      return
    }
    goto('/')
  }

  // Mount
  onMount(async () => {
    // Initialize worker
    const wasmRoot = '/argon2'
    const workerScript = process.env.NODE_ENV === 'development' ? 'worker.js' : 'worker.min.js'
    worker = new Worker(`${wasmRoot}/${workerScript}`)
    // Load argon2 binary
    listen.initResponseListener(worker, workerID)
    worker.postMessage({
      action: Argon2_Actions.LoadArgon2,
      body: {
        wasmRoot,
        simd: true
      }
    })
    const message: Argon2_Response = await listen.nextMessage(worker, workerID)
    if (message.code !== Argon2_ErrorCodes.ARGON2_OK) {
      state = states.error
      error = `Failed to load argon2. Something is down, please try registering again later. (code ${message.code})`
    }
  })
  onDestroy(() => {
    // listen.removeResponseListener(worker, workerID)
  })
</script>

<svelte:component this={navbar}></svelte:component>
<main>
  <div class="card">
    <header>Register</header>
    <form id="registerForm" bind:this={form} on:submit|preventDefault={register}>
      <input data-field="email" type="email" required autocomplete="email" placeholder="Email" bind:this={email}>
      <input data-field="password" type={ showPassword ? 'text' : 'password'} required autocomplete="new-password" placeholder="Password" bind:this={password}>
      <input data-field="confirmPassword" type={ showPassword ? 'text' : 'password'} required autocomplete="new-password" placeholder="Confirm Password" bind:this={confirmPassword}>
      <label>
        <input type="checkbox" bind:checked={showPassword}>
        <span class="checkable">Show Password</span>
      </label>
      <input type="submit" value="Submit">
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
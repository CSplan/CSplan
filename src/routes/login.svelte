<script lang="ts">
  import { goto } from '@sapper/app'
  import navbar from '../components/navbar.svelte'
  import user from '../stores/user'
  import { route } from '../route'
  import { rsa, encode, decode, aes, Algorithms } from 'cs-crypto'
  import { addToStore } from '../db'
  import { onMount } from 'svelte'
  import * as listen from '@very-amused/argon2-wasm/lib/listen'
  import type { Argon2HashParams, Challenge, SolvedChallenge, ErrorResponse, ChallengeResponse } from '../components/auth/register.svelte'
  import { Argon2_Actions, Argon2_ErrorCodes } from '@very-amused/argon2-wasm/lib/argon2'
  import type { Argon2_Request, Argon2_Response } from '@very-amused/argon2-wasm/lib/argon2'



  // Elements
  let form: HTMLFormElement
  let email: HTMLInputElement
  let password: HTMLInputElement
  // Web Worker
  let worker: Worker
  const workerID = 0

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
    if (!form.checkValidity()) {
      return
    }

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
      const challenge: Challenge = await res.json()
      if (res.status !== 200) {
        const err = <ErrorResponse>(<any>challenge)
        throw new Error(err.message || 'Failed to request an authentication challenge.')
      }
    
      // Run argon2i using the specified params
      const salt = ABdecode(challenge.salt)
      worker.postMessage(<Argon2_Request>{
        action: Argon2_Actions.Hash2i,
        body: {
          password: password.value,
          salt,
          timeCost: challenge.hashParams.timeCost,
          memoryCost: challenge.hashParams.memoryCost,
          hashLen: 32
        }
      })
      const message = await listen.nextMessage(worker, workerID)
      const keyMaterial = <Uint8Array>message.body
      const authKey = await crypto.subtle.importKey(
        'raw',
        keyMaterial,
        Algorithms.AES_GCM,
        false,
        ['wrapKey', 'unwrapKey', 'decrypt']
      )
      // Slice iv and encrypted challenge data
      const challengeData = ABdecode(challenge.data)
      const [iv, encrypted] = [challengeData.slice(0, 12), challengeData.slice(12)]

      // Decrypt the challenge data (and encode for transport)
      const decrypted = ABencode(await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv
        },
        authKey,
        encrypted
      ))
      // Submit the challenge
      res = await fetch(route(`/challenge/${challenge.id}?action=submit`), {
        method: 'POST',
        body: JSON.stringify({
          data: decrypted
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      const challengeResponse: ChallengeResponse = await res.json()
      if (res.status !== 200) {
        const err = <ErrorResponse>(<any>challengeResponse)
        throw new Error(err.message || 'Failed to submit challenge.')
      }
      // Store the CSRF token in localstorage
      localStorage.setItem('CSRF-Token', challengeResponse.CSRFtoken)
      user.login({
        email,
        id: challengeResponse.id
      })

      // Retrieve and decrypt the user's master RSA keypair
      stateMsg = 'Retrieving master keypair'
      res = await fetch(route('/keys'), {
        method: 'GET',
        headers: {
          'CSRF-Token': localStorage.getItem('CSRF-Token')!
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
      console.log(err)
      error = err.message
      state = states.error
      return
    }
  }

  onMount(async () => {
    // Initialize worker
    const wasmRoot = '/argon2'
    const workerScript = process.env.NODE_ENV === 'development' ? 'worker.js' : 'worker.min.js'
    worker = new Worker(`${wasmRoot}/${workerScript}`)
    // Load argon2 binary
    listen.initResponseListener(worker, workerID)
    worker.postMessage(<Argon2_Request>{
      action: Argon2_Actions.LoadArgon2,
      body: {
        wasmRoot,
        simd: true
      }
    })
    const message: Argon2_Response = await listen.nextMessage(worker, workerID)
    if (message.code !== Argon2_ErrorCodes.ARGON2_OK) {
      state = states.error
      error = `Failed to load argon2. Something is down, please try again later. (code ${message.code})`
    }
  })

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
    <form bind:this={form} on:submit|preventDefault={login}>
      <input bind:this={email} type="email" required autocomplete="email" placeholder="Email">
      <input bind:this={password} type={showPassword ? 'text' : 'password'} required autocomplete="current-password" placeholder="Password">
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
  form {
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
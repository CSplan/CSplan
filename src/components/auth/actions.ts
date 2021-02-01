import * as listen from '@very-amused/argon2-wasm/lib/listen'
import { Argon2_Actions, Argon2_ErrorCodes, Argon2_LoadParameters, Argon2_Request } from '@very-amused/argon2-wasm/lib/argon2'
import { Argon2HashParams } from '../crypto/argon2'
import { encode, ABconcat, aes, rsa, Algorithms, decode } from 'cs-crypto'
import * as db from '../../db'
import user from '../../stores/user'
import type { UserStore } from '../../stores/user'
import { get } from 'svelte/store'
import type { MasterKeys } from '../crypto/masterKey'

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
type RegisterRequest = {
  email: string,
  key: string,
  hashParams: Argon2HashParams
}


// TODO: update master route shaping function to typescript
function route(path: string) {
  return process.env.NODE_ENV === 'development' ? 'http://localhost:3030/api' + path : 'https://api.csplan.co' + path
}

// All authkeys are 32 bytes long
const AUTHKEY_SIZE = 32
// TODO: move CSRF tokens to IDB
const CSRF_TOKEN_KEY = 'CSRF-Token'

export class LoginActions {
  // eslint-disable-next-line no-unused-vars
  public onMessage: (message: string) => void = function() {}
  public hashParams: Argon2HashParams = {
    type: 'argon2i',
    timeCost: 1,
    memoryCost: 128 * 1024,
    threads: 1,
    saltLen: 16
  }

  protected worker: Worker
  protected workerID: number
  protected authKeyMaterial: Uint8Array|null = null


  // Initialize communication with web worker for multithreaded behavior
  constructor(worker: Worker, workerID: number) {
    this.worker = worker
    this.workerID = workerID
    listen.initResponseListener(worker, workerID)
  }

  // Load argon2 WASM into the web worker's scope
  async loadArgon2(params: Argon2_LoadParameters) {
    this.worker.postMessage(<Argon2_Request>{
      action: Argon2_Actions.LoadArgon2,
      body: params
    })
    const message = await listen.nextMessage(this.worker, this.workerID)
    if (message.code !== Argon2_ErrorCodes.ARGON2_OK) {
      // TODO: more descriptive error messages based on code
      throw new Error('Error loading argon2.')
    }
  }

  protected async hashPassword(password: string, salt: Uint8Array): Promise<Uint8Array> {
    this.worker.postMessage(<Argon2_Request>{
      action: Argon2_Actions.Hash2i,
      body: {
        password,
        salt,
        timeCost: this.hashParams.timeCost,
        memoryCost: this.hashParams.memoryCost,
        threads: this.hashParams.threads,
        hashLen: AUTHKEY_SIZE
      }
    })
    const message = await listen.nextMessage(this.worker, this.workerID)
    if (message.code !== Argon2_ErrorCodes.ARGON2_OK) {
      throw new Error('Error running argon2.')
    }
    return message.body!
  }

  async authenticate(email: string, password: string, salt: Uint8Array) {
    this.onMessage('Requesting authentication challenge')
    // Request an authentication challenge
    let res = await fetch(route('/challenge?action=request'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email
      })
    })
    if (res.status !== 200) {
      const err: ErrorResponse = await res.json()
      throw new Error(err.message || 'Unknown error requesting an auth challenge')
    }
    const challenge: Challenge = await res.json()

    // Load argon2 parameters from the challenge
    this.hashParams = challenge.hashParams

    // Hash the user's password (skip if authKey is already present)
    if (this.authKeyMaterial !== null) {
      this.onMessage('Using already generated authentication key')
    } else {
      this.onMessage('Generating authentication key')
      this.authKeyMaterial = await this.hashPassword(password, salt)
    }
     
    this.onMessage('Solving authentication challenge')
    // Import authkey material as an AES-GCM key
    const authKey = await aes.importKeyMaterial(this.authKeyMaterial, Algorithms.AES_GCM)
    // Decrypt the challenge using authKey
    const challengeData = decode(challenge.data)
    const [iv, encrypted] = [challengeData.slice(0, 12), challengeData.slice(12)]
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv
      },
      authKey,
      encrypted
    )
    this.onMessage('Submitting solved challenge')
    // Submit the solved challenge
    res = await fetch(route(`/challenge/${challenge.id}?action=submit`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(<SolvedChallenge>{
        data: encode(new Uint8Array(decrypted))
      })
    })
    if (res.status !== 200) {
      const err: ErrorResponse = await res.json()
      throw new Error(err.message || 'Error submitting challenge.')
    }
    this.onMessage('Successfully authenticated')

    const response: ChallengeResponse = await res.json()
    localStorage.setItem(CSRF_TOKEN_KEY, response.CSRFtoken)

    // Login to state
    user.login({
      email,
      id: response.id
    })
  }
}

export class RegisterActions extends LoginActions {
  constructor(worker: Worker, workerID: number) {
    super(worker, workerID)
  }

  async register(email: string, password: string, salt: Uint8Array): Promise<void> {
    // Hash the user's password (use whatever hash parameters are set before calling)
    this.onMessage('Generating authentication key')
    this.authKeyMaterial = await this.hashPassword(password, salt)
    this.hashParams.saltLen = salt.byteLength

    // Register the user (use whatever hash parameters are set before calling)
    const res = await fetch(route('/register'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(<RegisterRequest>{
        email,
        key: encode(ABconcat(salt, this.authKeyMaterial)),
        hashParams: this.hashParams
      })
    })
    if (res.status !== 201) {
      const err: ErrorResponse = await res.json()
      throw new Error(err.message || 'Failed to register account')
    }

    // Save userID and CSRFtoken
    const response: ChallengeResponse = await res.json()
    user.login({
      email,
      id: response.id
    })
    localStorage.setItem(CSRF_TOKEN_KEY, response.CSRFtoken)

    // The rest of the authentication flow is identical
    return this.authenticate(email, password, salt)
  }

  /** 
   * Generate a master keypair, wrapping the private key with a tempkey derived from password and salt
   * The salt used here MUST be different from the salt used for the authentication key, otherwise CSplan's encryption is rendered useless
   */
  async generateMasterKeypair(password: string, salt: Uint8Array, keysize = 4096) {
    this.onMessage('Generating master keypair')
    const tempKeyMaterial = await this.hashPassword(password, salt)
    const tempKey = await aes.importKeyMaterial(tempKeyMaterial, Algorithms.AES_GCM)

    // Perform the actual RSA generation, in the future, other kinds of master keypairs will be allowed, and possibly even default
    const { publicKey, privateKey } = await rsa.generateKeypair(keysize)

    // Export the public key in SPKI format
    const exportedPublicKey = await rsa.exportPublicKey(publicKey)

    // Encrypt and export the private key in pkcs8 format
    const encryptedPrivateKey = await rsa.wrapPrivateKey(privateKey, tempKey)

    // Store the keypair (along with the hash parameters used to reach them)
    const CSRFtoken = localStorage.getItem(CSRF_TOKEN_KEY)
    if (typeof CSRFtoken !== 'string') {
      throw new Error('Failed to retrieve CSRF-Token from localstorage.')
    }
    const res = await fetch(route('/keys'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': CSRFtoken
      },
      credentials: 'include',
      body: JSON.stringify(<MasterKeys>{
        publicKey: exportedPublicKey,
        privateKey: encryptedPrivateKey,
        hashSalt: encode(salt),
        hashParams: this.hashParams
      })
    })
    if (res.status !== 201) {
      const err: ErrorResponse = await res.json()
      throw new Error(err.message || 'Failed to store master keypair')
    }

    // Store keys in IDB
    // TODO: store checksum with master keypair
    const userID = (<UserStore>get(user)).user.id
    db.addToStore('keys', {
      id: userID,
      publicKey,
      privateKey
    })
  }
}
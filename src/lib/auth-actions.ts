import { Argon2 } from '@very-amused/argon2-wasm'
import { ED25519 } from '@very-amused/ed25519-wasm'
import { encode, aes, rsa, Algorithms, decode, makeSalt } from 'cs-crypto'
import * as db from '../db'
import userStore from '$stores/user'
import type { UserStore } from '$stores/user'
import { get } from 'svelte/store'
import { route } from '$lib/route'

export type Challenge = {
  id: string
  data: string
  hashParams: Argon2HashParams
}
export type SignedChallenge = {
  signature: string
}
type ChallengeRequest = {
  email: string
  totp?: number
}
export type ChallengeResponse = {
  userID: string
  sessionID: string
}
type RegisterRequest = {
  email: string
  key: string
  hashParams: Argon2HashParams
}
type AuthUser = {
  email: string
  password: string
  totp?: number
}
type MasterKeys = {
  publicKey: string
  privateKey: string
  hashParams: Argon2HashParams
}
type PasswordUpdate = {
  authKey: string
  privateKey: string
  hashParams: {
    auth: Argon2HashParams
    crypto: Argon2HashParams
  }
}


// All authkeys are 32 bytes long
const AUTHKEY_SIZE = 32
// authenticate may require further action, in which case it will return one of these codes instead of rejecting
export enum AuthConditions {
  Success,
  Upgraded,
  TOTPRequired
}

export class LoginActions {
  public onMessage: (message: string) => void = () => {}
  public hashParams: Argon2HashParams = {
    type: 'argon2i',
    timeCost: 1,
    memoryCost: 128 * 1024,
    threads: 1,
    salt: ''
  }

  protected argon2: Argon2.WorkerConnection
  protected ed25519: ED25519.WorkerConnection

  protected hashResult: Uint8Array|null = null
  protected signingKey: Uint8Array|null = null


  // Initialize communication with web worker for multithreaded behavior
  constructor(argon2: Worker, ed25519: Worker) {
    this.argon2 = new Argon2.WorkerConnection(argon2)
    this.ed25519 = new ED25519.WorkerConnection(ed25519)
  }

  // Load argon2 WASM into the web worker's scope
  async loadArgon2(params: Argon2.LoadParameters): Promise<void> {
    const message = await this.argon2.postMessage({
      method: Argon2.Methods.LoadArgon2,
      params
    })
    if (message.code !== Argon2.ErrorCodes.ARGON2_OK) {
      // TODO: more descriptive error messages based on code
      throw new Error('error loading argon2')
    }
  }

  // Load ed25519 WASM into the web worker's scope
  async loadED25519(params: ED25519.LoadParameters): Promise<void> {
    const message = await this.ed25519.postMessage({
      method: ED25519.Methods.LoadED25519,
      params
    })
    if (message.code !== ED25519.ErrorCodes.Success) {
      throw new Error('error loading ed25519')
    }
  }

  protected async hashPassword(password: string, salt: Uint8Array, hashParams?: Argon2HashParams): Promise<Uint8Array> {
    // Use whatever hashParams are set for the instance if none are given as a parameter
    if (hashParams == null) {
      hashParams = this.hashParams
    }
    const message = await this.argon2.postMessage({
      method: Argon2.Methods.Hash2i,
      params: {
        password,
        salt,
        timeCost: hashParams.timeCost,
        memoryCost: hashParams.memoryCost,
        hashLen: AUTHKEY_SIZE
      }
    })
    if (message.code !== Argon2.ErrorCodes.ARGON2_OK) {
      throw new Error('Error running argon2.')
    }
    return message.body!
  }

  protected async generateSigningKey(seed: Uint8Array, omitPublicKey = true): Promise<ED25519.GenerateResult['body']> {
    const message = await this.ed25519.postMessage({
      method: ED25519.Methods.GenerateKeypair,
      params: {
        seed,
        omitPublicKey
      }
    })
    if (message.code !== ED25519.ErrorCodes.Success) {
      throw new Error('error generating ed25519 signing key')
    }

    return message.body as ED25519.GenerateResult['body']
  }

  protected async signChallenge(challenge: Uint8Array, privateKey: Uint8Array): Promise<Uint8Array> {
    const message = await this.ed25519.postMessage({
      method: ED25519.Methods.SignMessage,
      params: {
        message: challenge,
        privateKey
      }
    })
    if (message.code !== ED25519.ErrorCodes.Success) {
      throw new Error('error using ed25519 to sign challenge')
    }

    return (message.body as ED25519.SignResult).signature
  }

  // TODO: refactor parameters into opts argument
  async authenticate(user: AuthUser, reuseAuthKey = false, upgrade = false): Promise<AuthConditions> {
    this.onMessage('Requesting authentication challenge')
    // Request an authentication challenge
    const challengeRequest: ChallengeRequest = { email: user.email, totp: user.totp }
    let res: Response
    if (upgrade) {
      res = await fetch(route('/upgrade?method=challenge&action=request'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': localStorage.getItem('CSRF-Token')!
        }
      })
    } else {
      res = await fetch(route('/challenge?action=request'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(challengeRequest)
      })
    }
    if (res.status === 412) {
      return AuthConditions.TOTPRequired
    }
    if (upgrade && res.status === 200) {
      return AuthConditions.Upgraded
    }
    if (res.status !== 201) {
      const err: ErrorResponse = await res.json()
      throw new Error(err.message || 'Unknown error requesting an auth challenge')
    }
    const challenge: Challenge = await res.json()

    // Load argon2 parameters and decode salt from the challenge
    const salt = decode(challenge.hashParams.salt)

    // Hash the user's password (skip if authKey is already present)
    if (reuseAuthKey) {
      this.onMessage('using already generated authentication key')
    } else {
      this.onMessage('generating authentication key')
      this.hashResult = await this.hashPassword(user.password, salt, this.hashParams)
    }
     
    this.onMessage('solving authentication challenge')
    // Use the argon2 output as a seed to derive an ed25519 keypair
    // TODO: Memoize signing key generation
    const { privateKey } = await this.generateSigningKey(this.hashResult!)
    this.signingKey = privateKey

    // Sign the challenge data
    this.onMessage('signing challenge')
    const signature = await this.signChallenge(decode(challenge.data), this.signingKey)
    this.onMessage('submitting challenge')
    res = await fetch(route(`/challenge/${challenge.id}?${upgrade ? 'type=upgrade&' : ''}action=submit`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(<SignedChallenge>{
        signature: encode(signature)
      })
    })
    if (res.status === 401) {
      throw new Error('Authorization failure, password is incorrect')
    } else if (res.status !== 200) {
      const err: ErrorResponse = await res.json()
      throw new Error(err.message || 'Unknown error submitting challenge')
    }

    this.onMessage('successfully authenticated')

    // If the user is upgrading an existing authentication session, the CSRF token and local state don't need to be updated
    if (upgrade) {
      return AuthConditions.Upgraded
    }

    const response: ChallengeResponse = await res.json()
    const csrfToken = res.headers.get('CSRF-Token')
    if (csrfToken == null) {
      throw new Error('empty CSRF Token from API')
    }
    localStorage.setItem('CSRF-Token', csrfToken)

    // Login to state
    userStore.login({
      email: user.email,
      id: response.userID
    })
    return AuthConditions.Success
  }

  async retrieveMasterKeypair(password: string, exportablePrivateKey = false): Promise<CryptoKeyPair> {
    // Fetch the user's master keypair
    const res = await fetch(route('/keys'), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': localStorage.getItem('CSRF-Token')!
      },
      credentials: 'include'
    })
    if (res.status !== 200) {
      const err: ErrorResponse = await res.json()
      throw new Error(err.message || 'Failed to fetch master keypair')
    }
    const keys: MasterKeys = await res.json()

    // Decode master public key
    const publicKey = await rsa.importPublicKey(keys.publicKey)

    // Decrypt master private key
    this.onMessage('Decrypting master keypair')
    const tempKeyMaterial = await this.hashPassword(password, decode(keys.hashParams.salt), keys.hashParams)
    const tempKey = await aes.importKeyMaterial(tempKeyMaterial, Algorithms.AES_GCM)
    const privateKey = await rsa.unwrapPrivateKey(keys.privateKey, tempKey, exportablePrivateKey)

    // Store keys in IDB
    const userID = (<UserStore>get(userStore)).user.id
    await db.addToStore('keys', {
      id: userID,
      publicKey,
      privateKey
    })
    return {
      publicKey,
      privateKey
    }
  }
}

export class RegisterActions extends LoginActions {
  constructor(argon2: Worker, ed25519: Worker) {
    super(argon2, ed25519)
  }

  async register(user: AuthUser, salt: Uint8Array): Promise<void> {
    // Hash the user's password (use whatever hash parameters are set before calling)
    this.hashParams.salt = encode(salt)
    this.onMessage('Generating authentication key')
    this.hashResult = await this.hashPassword(user.password, salt)

    this.onMessage('Generating signing key')
    const { publicKey, privateKey } = await this.generateSigningKey(this.hashResult!, false)
    this.signingKey = privateKey

    // Register the user (use whatever hash parameters are set before calling)
    const res = await fetch(route('/register'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(<RegisterRequest>{
        email: user.email,
        key: encode(publicKey!),
        hashParams: this.hashParams
      })
    })
    if (res.status !== 201) {
      const err: ErrorResponse = await res.json()
      throw new Error(err.message || 'Failed to register account')
    }

    // The rest of the authentication flow is identical
    this.authenticate(user, true)
    return
  }

  async testHashParams(password: string): Promise<number> {
    const start = performance.now()
    await this.hashPassword(password, makeSalt(16)) // random salts are used for each run for security purposes
    return performance.now() - start
  }

  /** 
   * Generate a master keypair, wrapping the private key with a tempkey derived from password and salt
   * The salt used here MUST be different from the salt used for the authentication key, otherwise CSplan's encryption is rendered useless
   */
  async generateMasterKeypair(password: string, salt: Uint8Array, keysize = 4096): Promise<void> {
    this.onMessage('Generating master keypair')
    const tempKeyMaterial = await this.hashPassword(password, salt)
    const tempKey = await aes.importKeyMaterial(tempKeyMaterial, Algorithms.AES_GCM)

    // Perform the actual RSA generation, in the future, other kinds of master keypairs will be allowed, and possibly even default
    const { publicKey, privateKey } = await rsa.generateKeypair(keysize)

    // Export the public key in SPKI format
    const exportedPublicKey = await rsa.exportPublicKey(publicKey!)

    // Encrypt and export the private key in pkcs8 format
    const encryptedPrivateKey = await rsa.wrapPrivateKey(privateKey!, tempKey)

    // Store the keypair (along with the hash parameters used to reach them)
    const CSRFtoken = localStorage.getItem('CSRF-Token')
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
        hashParams: {
          ...this.hashParams,
          salt: encode(salt)
        }
      })
    })
    if (res.status !== 201) {
      const err: ErrorResponse = await res.json()
      throw new Error(err.message || 'Failed to store master keypair')
    }

    // Store keys in IDB
    // TODO: store checksum with master keypair
    const userID = (<UserStore>get(userStore)).user.id
    db.addToStore('keys', {
      id: userID,
      publicKey,
      privateKey
    })
  }

  /**
   * Confirm that all steps of registration were completed without error,
   * accounts will be pruned within one minute of registration if this endpoint isn't hit by then
   */
  async confirmAccount(): Promise<void> {
    const userID = (get(userStore) as UserStore).user.id
    const res = await fetch(route(`/confirm_account/${userID}`), {
      method: 'POST'
    })
    if (res.status !== 204) {
      const err: ErrorResponse = await res.json()
      throw new Error(err.message || 'failed to confirm account')
    }
  }
}

export class PasswordChangeActions extends RegisterActions {
  constructor(argon2: Worker, ed25519: Worker) {
    super(argon2, ed25519)
  }

  /**
   * Change a user's password
   * @param oldPassword The old password, used to decrypt a current copy of the user's private key
   * @param newPassword The user's new password
   * @param authSalt The salt to be used in deriving the authentication key seed
   * @param cryptoSalt The salt to be used in deriving the tempkey used to decrypt the user's master private key
   */
  async changePassword(oldPassword: string, newPassword: string,
    authSalt: Uint8Array, cryptoSalt: Uint8Array): Promise<void> {
    // Derive an authentication keypair from the new password and salt
    this.hashResult = await this.hashPassword(newPassword, authSalt)
    const { publicKey } = await this.generateSigningKey(this.hashResult!, false)

    // Fetch and re-encrypt the user's master private key
    const { privateKey } = await this.retrieveMasterKeypair(oldPassword, true)
    const tempKeyMaterial = await this.hashPassword(newPassword, cryptoSalt)
    const tempKey = await aes.importKeyMaterial(tempKeyMaterial, Algorithms.AES_GCM)
    const encryptedPrivateKey = await rsa.wrapPrivateKey(privateKey!, tempKey)

    // Update the authentication and private key with the API
    const res = await fetch(route('/change_password'), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': localStorage.getItem('CSRF-Token')!
      },
      body: JSON.stringify(<PasswordUpdate>{
        authKey: encode(publicKey!),
        privateKey: encryptedPrivateKey,
        hashParams: {
          auth: {
            ...this.hashParams,
            salt: encode(authSalt)
          },
          crypto: {
            ...this.hashParams,
            salt: encode(cryptoSalt)
          }
        }
      })
    })
    if (res.status !== 204) {
      const err: ErrorResponse = await res.json()
      throw new Error(err.message || 'error updating password with API')
    }
  }
}
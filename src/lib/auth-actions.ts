import { Argon2 } from '@very-amused/argon2-wasm'
import { ED25519 } from '@very-amused/ed25519-wasm'
import { encode, aes, rsa, Algorithms, decode, makeSalt } from 'cs-crypto'
import * as db from '../db'
import userStore, { type User } from '$stores/user'
import { sessions as sessionStore } from '$stores/sessions'
import { get } from 'svelte/store'
import { route, HTTPerror, csfetch } from '$lib'
import qrcodegen from './qrcodegen'
import storage from '$db/storage'
import { dev } from '$app/env'
import { AuthLevels } from './auth-levels'
import AccountTypes from '$lib/account-types'

// #region Types

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
  TOTP_Code?: number
}
export type ChallengeResponse = {
  userID: string
  sessionID: string
  verified: boolean
  accountType: AccountTypes
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
type EmailUpdate = {
  email: string
}

// #endregion


// All authkeys are 32 bytes long
const AUTHKEY_SIZE = 32
// authenticate may require further action, in which case it will return one of these codes instead of rejecting
export enum AuthConditions {
  Success,
  Upgraded,
  TOTPRequired
}

export class LoginActions {
  onMessage: (message: string) => void = () => {}
  hashParams: Argon2HashParams = {
    type: 'argon2i',
    timeCost: 1,
    memoryCost: 128 * 1024,
    threads: 1,
    salt: ''
  }

  protected argon2: Argon2.WorkerConnection
  protected ed25519: ED25519.WorkerConnection
  // Temporarily needed for public beta transition
  private argon2Worker: Worker
  private ed25519Worker: Worker

  protected hashResult: Uint8Array|null = null
  protected signingKey: Uint8Array|null = null

  // Private beta account transition
  privateBetaAccount = false

  /** Expected path of argon2 web worker */
  static readonly Argon2_WorkerPath = `/argon2/worker${dev ? '' : '.min'}.js`
  /** Expected path of ed25519 web worker */
  static readonly ED25519_WorkerPath = `/ed25519/worker${dev ? '' : '.min'}.js`

  /** Expected root path for argon2 wasm binaries */
  static readonly Argon2_WASMRoot = '/argon2'
  /** Expected path of ed25519 wasm binary */
  static readonly ED25519_WASMPath = '/ed25519/ed25519.wasm'


  // Initialize communication with web worker for multithreaded behavior
  constructor(argon2: Worker, ed25519: Worker) {
    this.argon2 = new Argon2.WorkerConnection(argon2)
    this.ed25519 = new ED25519.WorkerConnection(ed25519)
    this.argon2Worker = argon2
    this.ed25519Worker = ed25519
  }

  // Load argon2 WASM into the web worker's scope
  async loadArgon2(params: Argon2.LoadParameters): Promise<void> {
    const message = await this.argon2.postMessage({
      method: Argon2.Methods.LoadArgon2,
      params
    })
    if (message.code !== Argon2.ErrorCodes.ARGON2_OK) {
      // TODO: more descriptive error messages based on code
      throw new Error('Error loading argon2')
    }
  }

  // Load ed25519 WASM into the web worker's scope
  async loadED25519(params: ED25519.LoadParameters): Promise<void> {
    const message = await this.ed25519.postMessage({
      method: ED25519.Methods.LoadED25519,
      params
    })
    if (message.code !== ED25519.ErrorCodes.Success) {
      throw new Error('Error loading ed25519')
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
      if (dev) {
        console.debug(`Argon2 memory cost: ${hashParams.memoryCost}`)
        throw new Error(`Error running argon2, error code: ${Argon2.ErrorCodes[message.code]}`)
      }
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
      throw new Error('Error generating ed25519 signing key')
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
      throw new Error('Error using ed25519 to sign challenge')
    }

    return (message.body as ED25519.SignResult).signature
  }

  // TODO: refactor parameters into opts argument
  async authenticate(user: AuthUser, reuseAuthKey = false, upgrade = false): Promise<AuthConditions> {
    this.onMessage('Requesting authentication challenge')
    // Request an authentication challenge
    let res: Response
    if (upgrade) {
      res = await csfetch(route('/upgrade?method=challenge&action=request'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': storage.getCSRFtoken()
        }
      })
    } else {
      const challengeRequest: ChallengeRequest = { email: user.email, TOTP_Code: user.totp }
      res = await csfetch(route('/challenge?action=request'), {
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
    this.privateBetaAccount = res.headers.get('X-Private-Beta-Account') != null
      
    // Load argon2 parameters and decode salt from the challenge
    const salt = decode(challenge.hashParams.salt)
    this.hashParams = challenge.hashParams

    // Hash the user's password (skip if authKey is already present)
    const normalizedPassword = this.privateBetaAccount ? user.password.normalize('NFKC') : user.password.normalize('NFC')
    if (reuseAuthKey) {
      this.onMessage('Using already generated authentication key')
    } else {
      this.onMessage('Generating authentication key')
      this.hashResult = await this.hashPassword(normalizedPassword, salt)
    }
     
    this.onMessage('Solving authentication challenge')
    // Use the argon2 output as a seed to derive an ed25519 keypair
    // TODO: Memoize signing key generation
    const { privateKey } = await this.generateSigningKey(this.hashResult!)
    this.signingKey = privateKey

    // Sign the challenge data
    this.onMessage('Signing challenge')
    const signature = await this.signChallenge(decode(challenge.data), this.signingKey)
    this.onMessage('Submitting challenge')
    res = await csfetch(route(`/challenge/${challenge.id}?${upgrade ? 'type=upgrade&' : ''}action=submit`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(<SignedChallenge>{
        signature: encode(signature)
      }),
      credentials: 'include'
    })
    if (res.status === 401) {
      throw new Error('Authorization failure, password is incorrect')
    } else if (res.status !== 200) {
      const err: ErrorResponse = await res.json()
      throw new Error(err.message || 'Unknown error submitting challenge')
    }

    this.onMessage('Successfully authenticated')

    // If the user is upgrading an existing authentication session, the CSRF token and local state don't need to be updated
    if (upgrade) {
      return AuthConditions.Upgraded
    }

    const response: ChallengeResponse = await res.json()
    const csrfToken = res.headers.get('csrf-token')
    if (csrfToken == null) {
      throw new Error('Empty CSRF Token from API')
    }
    storage.setCSRFtoken(csrfToken)

    // Set logged in state
    const session: User = {
      isLoggedIn: true,
      email: user.email,
      id: response.userID,
      verified: response.verified,
      accountType: response.accountType
    }
    userStore.set(session)
    storage.setUser(session)
    return AuthConditions.Success
  }

  async retrieveMasterKeypair(password: string, extractablePrivateKey = false, noRecursiveTransition = false): Promise<CryptoKeyPair> {
    // Fetch the user's master keypair
    const res = await csfetch(route('/keys'), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': storage.getCSRFtoken()
      },
      credentials: 'include'
    })
    if (res.status !== 200) {
      const err: ErrorResponse = await res.json()
      throw new Error(err.message || 'Failed to csfetch master keypair')
    }
    const keys: MasterKeys = await res.json()

    // Decode master public key
    const publicKey = await rsa.importPublicKey(keys.publicKey)

    // Decrypt master private key
    const normalizedPassword = this.privateBetaAccount ? password.normalize('NFKC') : password.normalize('NFC')
    this.onMessage('Decrypting master keypair')
    const tempKeyMaterial = await this.hashPassword(normalizedPassword, decode(keys.hashParams.salt), keys.hashParams)
    const tempKey = await aes.importKeyMaterial(tempKeyMaterial, Algorithms.AES_GCM)
    const privateKey = await rsa.unwrapPrivateKey(keys.privateKey, tempKey, extractablePrivateKey)

    // Store keys in IDB
    if (!extractablePrivateKey) { // Extractable private keys are only used for export, and shouldn't be stored
      const user = get(userStore) as Assert<User, 'isLoggedIn'>
      await db.addToStore('keys', {
        id: user.id,
        publicKey,
        privateKey
      })
    }
    // Transition private beta accounts
    if (this.privateBetaAccount && !noRecursiveTransition) {
      // Upgrade to level 2 auth
      await UpgradeActions.passwordUpgrade(this, normalizedPassword)
      await this.publicBetaTransition(password, decode(keys.hashParams.salt))
    }

    return {
      publicKey,
      privateKey
    }
  }

  /** 
   * Transition a private beta account to the new systems of normalization and automatic hash parameters used for CSplan's public beta. 
   * @param password A pre-normalization form of the user's password.
   * @param cryptoSalt The salt used in decrypting the user's private key.
   */
  async publicBetaTransition(password: string, cryptoSalt: Uint8Array): Promise<void> {
    // Auth level 2 is required to change hash params
    await UpgradeActions.passwordUpgrade(this, password)
    // Change the user's password and hash params
    const actions = new PasswordChangeActions(this.argon2Worker, this.ed25519Worker)
    const authSalt = decode(this.hashParams.salt)
    this.onMessage('Transitioning account to public beta')
    await actions.changePassword(password, password, authSalt, cryptoSalt, true)
  }
}

export class RegisterActions extends LoginActions {
  /** Whether to generate hash parameters based on a targeted 1s login time, or use manually set parameters. */
  useAutoHashParams = true

  constructor(argon2: Worker, ed25519: Worker) {
    super(argon2, ed25519)
  }

  async register(user: AuthUser, salt: Uint8Array): Promise<void> {
    const normalizedPassword = user.password.normalize('NFC')
    // Calculate hash parameters
    if (this.useAutoHashParams) {
      const autoParams = new Argon2AutoParams(this.argon2, this.hashPassword, normalizedPassword)
      this.hashParams = await autoParams.calculateParams()
    }

    // Hash the user's password
    this.hashParams.salt = encode(salt)
    this.onMessage('Generating authentication key')
    this.hashResult = await this.hashPassword(normalizedPassword, salt)

    this.onMessage('Generating signing key')
    const { publicKey, privateKey } = await this.generateSigningKey(this.hashResult!, false)
    this.signingKey = privateKey

    // Register the user (use whatever hash parameters are set before calling)
    const registerRequest: RegisterRequest = {
      email: user.email,
      key: encode(publicKey!),
      hashParams: this.hashParams
    }
    const res = await csfetch(route('/register'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify<RegisterRequest>(registerRequest)
    })
    if (res.status !== 201) {
      const err: ErrorResponse = await res.json()
      throw new Error(err.message || 'Failed to register account')
    }

    // The rest of the authentication flow is identical
    this.authenticate(user, true)
    return
  }

  /** 
   * Generate a master keypair, wrapping the private key with a tempkey derived from password and salt
   * The salt used here MUST be different from the salt used for the authentication key, otherwise CSplan's encryption is rendered useless
   */
  async generateMasterKeypair(password: string, salt: Uint8Array, keysize = 4096): Promise<void> {
    const normalizedPassword = this.privateBetaAccount ? password.normalize('NFKC') : password.normalize('NFC')
    this.onMessage('Generating master keypair')
    const tempKeyMaterial = await this.hashPassword(normalizedPassword, salt)
    const tempKey = await aes.importKeyMaterial(tempKeyMaterial, Algorithms.AES_GCM)

    // Perform the actual RSA generation, in the future, other kinds of master keypairs will be allowed, and possibly even default
    const { publicKey, privateKey } = await rsa.generateKeypair(keysize)

    // Export the public key in SPKI format
    const exportedPublicKey = await rsa.exportPublicKey(publicKey!)

    // Encrypt and export the private key in pkcs8 format
    const encryptedPrivateKey = await rsa.wrapPrivateKey(privateKey!, tempKey)

    // Store the keypair (along with the hash parameters used to reach them)
    const CSRFtoken = storage.getCSRFtoken()
    const res = await csfetch(route('/keys'), {
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
      throw new Error(await HTTPerror(res, 'Failed to store master keypair'))
    }

    // Store keys in IDB
    // TODO: store checksum with master keypair
    const user = get(userStore) as Assert<User, 'isLoggedIn'>
    db.addToStore('keys', {
      id: user.id,
      publicKey,
      privateKey
    })
  }

  /**
   * Confirm that all steps of registration were completed without error,
   * accounts will be pruned within one minute of registration if this endpoint isn't hit by then
   */
  async confirmAccount(): Promise<void> {
    const user = get(userStore) as Assert<User, 'isLoggedIn'>
    const res = await csfetch(route(`/confirm_account/${user.id}`), {
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
    authSalt: Uint8Array, cryptoSalt: Uint8Array, privateBetaTransition = false): Promise<void> {
    // Normalize the new password
    const normalizedNewPassword = newPassword.normalize('NFC')
    
    this.privateBetaAccount = privateBetaTransition // TODO: pain. remove legacy transition stuff the minute it can be removed.
    // Fetch the user's existing private key material
    const { privateKey } = await this.retrieveMasterKeypair(oldPassword, true, true) // Normalization is done internally
    // If transitioning from a private beta account, generate new automatic hash parameters
    if (this.privateBetaAccount) {
      const autoParams = new Argon2AutoParams(this.argon2, this.hashPassword, normalizedNewPassword)
      this.hashParams = await autoParams.calculateParams()
    }

    // Derive an authentication keypair from the new password and salt
    this.hashResult = await this.hashPassword(normalizedNewPassword, authSalt)
    const { publicKey } = await this.generateSigningKey(this.hashResult!, false)

    // Re-encrypt the user's master private key
    const tempKeyMaterial = await this.hashPassword(normalizedNewPassword, cryptoSalt)
    const tempKey = await aes.importKeyMaterial(tempKeyMaterial, Algorithms.AES_GCM)
    const encryptedPrivateKey = await rsa.wrapPrivateKey(privateKey!, tempKey)

    // Update the authentication and private key with the API
    const res = await csfetch(route('/change_password' + (this.privateBetaAccount ? '?public_beta_transition' : '')), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': storage.getCSRFtoken()
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

export const EmailChangeActions = {
  /**
   * Change a user's email address. A verification email will be sent to the old address.
   * Both the old and new address can be used to log in until the new email is verified. 
   * If the new email is now verified within 24hr, the account will revert to the old email.
   */
  async changeEmail(actions: LoginActions, password: string, newEmail: string): Promise<void> {
    // Email changes require lvl 2 auth
    await UpgradeActions.passwordUpgrade(actions, password)

    const body: EmailUpdate = {
      email: newEmail
    }
    const res = await csfetch(route('/change-email'), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': storage.getCSRFtoken()
      },
      body: JSON.stringify(body)
    })
    if (res.status !== 204) {
      const err: ErrorResponse = await res.json()
      throw new Error(err.message || 'Unknown error changing email.')
    }
    userStore.update((store) => {
      (store as Assert<User, 'isLoggedIn'>).email = newEmail
      return store
    })

    await UpgradeActions.downgrade()
  }
}


export const UpgradeActions = {
  /**
   * Upgrade a user's authentication level using argon2-ed25519 password challenge authorization
   */
  async passwordUpgrade(actions: LoginActions, password: string): Promise<void> {
    await actions.authenticate({
      email: '',
      password
    }, false, true)
    await sessionStore.init()
    sessionStore.setAuthLevel(AuthLevels.Upgraded)
  },

  /**
   * Upgrade a user's authentication level using totp code authorization
   */
  async totpUpgrade(code: number): Promise<void> {
    const body: TOTPRequest = {
      TOTP_Code: code
    }
    const res = await csfetch(route('/upgrade?method=totp'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': storage.getCSRFtoken()
      },
      body: JSON.stringify(body)
    })
    if (res.status !== 200) {
      throw new Error(await HTTPerror(res, 'TOTP authorization failure'))
    }
    await sessionStore.init()
    sessionStore.setAuthLevel(AuthLevels.Upgraded)
  },

  /**
   * Downgrade a user's authentication level 
   * (authentication downgrades automatically occur serverside 10 minutes after upgrade if not manually performed beforehand)
   */
  async downgrade(): Promise<void> {
    const res = await csfetch(route('/downgrade'), {
      method: 'POST',
      headers: {
        'CSRF-Token': storage.getCSRFtoken()
      }
    })
    if (res.status !== 200) {
      throw new Error(await HTTPerror(res, 'Failed to downgrade authentication level'))
    }
    await sessionStore.init()
    sessionStore.setAuthLevel(AuthLevels.Normal)
  }
}

export const TOTPActions = {
  /**
   * Enable TOTP authentication for the user (requires level 2 auth)
   */
  async enable(): Promise<TOTPinfo> {
    // Enable TOTP for the user
    const res = await csfetch(route('/totp?action=enable'), {
      method: 'POST',
      headers: {
        'CSRF-Token': storage.getCSRFtoken()
      }
    })
    if (res.status !== 201) {
      throw new Error(await HTTPerror(res, 'Failed to enable TOTP authentication'))
    }
    return res.json()
  },

  /**
   * Verify TOTP authentication (only needs to be done immediately after enabling TOTP)
   */
  async verify(code: number): Promise<void> {
    const body: TOTPRequest = {
      TOTP_Code: code
    }
    const res = await csfetch(route('/totp/verify'), {
      method: 'POST',
      headers: {
        'CSRF-Token': storage.getCSRFtoken()
      },
      body: JSON.stringify(body)
    })
    if (res.status === 401) {
      throw new Error('Invalid TOTP code')
    }
    if (res.status !== 200) {
      throw new Error(await HTTPerror(res, 'Error verifying TOTP code'))
    }
  },

  /**
   * Disable TOTP authentication for the user (requires level 2 auth)
   */
  async disable(): Promise<void> {
    const res = await csfetch(route('/totp?action=disable'), {
      method: 'POST',
      headers: {
        'CSRF-Token': storage.getCSRFtoken()
      }
    })
    if (res.status !== 204) {
      throw new Error(await HTTPerror(res, 'Failed to disable TOTP authentication'))
    }
  },
  
  /**
   * Convert a TOTP secret into a valid otpauth URI 
   */
  URI(issuer: string, user: string, secret: string): string {
    return `otpauth://totp/${issuer}:${user}?secret=${secret}&issuer=${issuer}`
  },

  /**
   * Encode an otpauth URI as a QR code
   */
  qrCode(uri: string): qrcodegen.QrCode {
    return qrcodegen.QrCode.encodeText(uri, qrcodegen.QrCode.Ecc.LOW)
  },

  /**
   * @copyright Project Nayuki. (MIT License)
   * https://www.nayuki.io/page/qr-code-generator-library
   * 
   * Modified version of Nayuki's toSvgString function, operates on a SVG element
   */
  qr2svg(qr: qrcodegen.QrCode, svg: SVGSVGElement, border: number, lightColor: string, darkColor: string): void {
    if (border < 0) {
      throw 'Border must be non-negative'
    }
    const parts: string[] = []
    for (let y = 0; y < qr.size; y++) {
      for (let x = 0; x < qr.size; x++) {
        if (qr.getModule(x, y))
          parts.push(`M${x + border},${y + border}h1v1h-1z`)
      }
    }

    const svgNS = 'http://www.w3.org/2000/svg'
    svg.setAttribute('viewBox', `0 0 ${qr.size + border * 2} ${qr.size + border * 2}`)
    svg.setAttribute('stroke', 'none')
    const rect = document.createElementNS(svgNS, 'rect')
    rect.setAttribute('width', '100%')
    rect.setAttribute('height', '100%')
    rect.setAttribute('fill', lightColor)
    svg.appendChild(rect)
    const path = document.createElementNS(svgNS, 'path')
    path.setAttribute('d', parts.join(' '))
    path.setAttribute('fill', darkColor)
    svg.appendChild(path)
  }
}

/** Class used to automatically calculate a set of Argon2 parameters for an account. */
export class Argon2AutoParams {
  private argon2: Argon2.WorkerConnection // Needed for hashPassword to work
  private hashPassword: (password: string, salt: Uint8Array, hashParams?: Argon2HashParams) => Promise<Uint8Array>
  private password: string
  private salt: Uint8Array = makeSalt(16) // Random salt

  private hashParams: Argon2HashParams = { ...Argon2AutoParams.BaseHashParams }

  /** The minimum memory parameter CSplan will use in automatically calculated hash parameters. Lower values can be selected in manual hash parameters. */
  static readonly MinMemory = 128 * 1024
  /** The maximum memory parameter CSplan will use in automatically calculated hash params. Higher values can be selected in manual hash parameters. */
  static readonly MaxMemory = 512 * 1024

  /** https://github.com/P-H-C/phc-winner-argon2/blob/master/argon2-specs.pdf [Sec 5.6] */
  static readonly MinTime = 3

  private static readonly BaseHashParams: Readonly<Argon2HashParams> = Object.freeze({
    type: 'argon2i',
    timeCost: this.MinTime,
    memoryCost: this.MinMemory,
    threads: 1,
    salt: ''
  })

  constructor(argon2: Argon2.WorkerConnection, hashPassword: Argon2AutoParams['hashPassword'], password: string) {
    this.argon2 = argon2
    this.hashPassword = hashPassword
    this.password = password.normalize('NFC')
  }

  /** Calculate a set of hash params based on a target hash time in ms. */
  async calculateParams(targetTime = 500): Promise<Argon2HashParams> {
    // TODO: add tests
    // Get a base hash time with the base parameters
    const baseTime = await this.hashTime()
    // Store the ratio of the target hash time to the base hash time, which can be factored into multipliers for memory and time parameters
    const ratio = (targetTime / baseTime)
    if (ratio < 1) {
      return this.hashParams
    }

    // The target may possibly be reached by only increasing memory without the max memory value
    const maxMemoryMultiplier = (Argon2AutoParams.MaxMemory / Argon2AutoParams.MinMemory) // = 4
    if (ratio <= maxMemoryMultiplier) {
      this.hashParams.memoryCost = Math.floor(ratio * this.hashParams.memoryCost)
      return this.hashParams
    }

    // Otherwise, increase the time value until a memory value between 128MB and 512MB can be used
    while ((ratio / this.hashParams.timeCost) > maxMemoryMultiplier) {
      this.hashParams.timeCost++
    }
    this.hashParams.memoryCost = Math.floor((ratio / this.hashParams.timeCost) * this.hashParams.memoryCost)

    return this.hashParams
  }

  /** Return the time is takes to hash the user's password */
  private async hashTime(): Promise<number> {
    const start = performance.now()
    await this.hashPassword(this.password, this.salt, this.hashParams)
    return performance.now() - start
  }
}
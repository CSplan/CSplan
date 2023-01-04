import { aes, rsa } from 'cs-crypto'
import { HTTPerror, DisplayNames, Visibilities, route, csfetch } from '$lib'
import { mustGetByKey, getByKey, addToStore } from '$db'
import { pageStorage } from '$lib/page'
import { Store } from '../store'

/** Name(s) associated with a user account */
export type Name<E extends boolean = false> = NameData<E> & {
  exists: true
  id: string
  meta: Omit<Meta<E>, 'cryptoKey'> & { cryptoKey?: Meta<E>['cryptoKey'] }
} | {
  exists: false
}

/** Structure describing username state in response to /username requests */
export type Username = {
  username: string
  displayName?: NameData['displayName'] // Non-null in GET responses
  meta?: State // Non-null in POST responses
}

/** Multiple names for a user account and visibility information */
export type NameData<E extends boolean = false> = {
  firstName: string
  lastName: string
  username?: string

  visibility: NameVisibility

  displayName: import('$lib').DisplayNames
  privateDisplayName?: E extends true ? string : import('$lib').DisplayNames
}

/** Visibility information for first/last name */
export type NameVisibility = {
  firstName: import('$lib').Visibilities
  lastName: import('$lib').Visibilities
}

class NameStore extends Store<Name> {
  private initialized = false

  constructor() {
    super({
      exists: false
    })
  }

  async init(this: NameStore): Promise<void> {
    if (this.initialized) {
      return
    }

    const user = pageStorage.getJSON('user')!
    const res = await csfetch(route('/name'))
    if (res.status === 204) {
      this.initialized = true
      return
    }
    if (res.status !== 200) {
      throw await HTTPerror(res, 'Failed to retrieve name from server')
    }

    const body: Assert<Name<true>, 'exists'> = await res.json()
    const cached = await getByKey<Name>('user/name', user.id)
    if (cached != null && cached.exists && cached.meta.checksum === body.meta.checksum) {
      this.set(cached)
      return
    }
  
    const visibility = body.visibility

    const decryptFirstName = visibility.firstName === Visibilities.Encrypted
    const decryptLastName = visibility.lastName === Visibilities.Encrypted
    const hasEncryptedFields = decryptFirstName || decryptLastName || body.privateDisplayName != null
    // Decrypt the cryptokey if needed
    let cryptoKey: CryptoKey|undefined
    if (hasEncryptedFields && body.meta.cryptoKey != null) {
      const { privateKey } = await mustGetByKey<MasterKeys>('keys', user.id)
      cryptoKey = await rsa.unwrapKey(body.meta.cryptoKey, privateKey, 'AES-GCM')
    }

    // Decrypt necessary fields
    const firstName = decryptFirstName ? await aes.decrypt(body.firstName, cryptoKey!) : body.firstName
    const lastName = decryptLastName ? await aes.decrypt(body.lastName, cryptoKey!) : body.lastName
    let namePreference: DisplayNames|undefined
    if (body.privateDisplayName != null) {
      namePreference = parseInt(await aes.decrypt(body.privateDisplayName, cryptoKey!))
    }

    // Update local state
    const final: Name = {
      exists: true,
      id: user.id,
      firstName,
      lastName,
      username: body.username,
      visibility,
      privateDisplayName: namePreference,
      displayName: body.displayName,
      meta: {
        cryptoKey: cryptoKey,
        checksum: body.meta.checksum
      }
    }
    this.set(final)
    await addToStore('user/name', final)
    this.initialized = true
  }

  /** Create or update */
  async create(name: NameData): Promise<string> {
    // Get the user's ID
    const user = pageStorage.getJSON('user')!

    // Generate a key if there are any fields that need to be encrypted
    const visibility = name.visibility
    const encryptFirstName = visibility.firstName === Visibilities.Encrypted
    const encryptLastName = visibility.lastName === Visibilities.Encrypted
    const hasEncryptedFields = encryptFirstName || encryptLastName || name.privateDisplayName != null
    let cryptoKey: CryptoKey|undefined
    if (hasEncryptedFields) {
      cryptoKey = await aes.generateKey('AES-GCM')
    } 
    // Encrypt any necessary fields
    const firstName = encryptFirstName ? await aes.encrypt(name.firstName, cryptoKey!) : name.firstName
    const lastName = encryptLastName ? await aes.encrypt(name.lastName, cryptoKey!) : name.lastName
    let privateDisplayName: string|undefined
    if (name.privateDisplayName != null){
      privateDisplayName = await aes.encrypt(name.privateDisplayName.toString(), cryptoKey!)
    }

    // Encrypt the cryptokey
    let encryptedKey: string|undefined
    if (cryptoKey != null) {
      const { publicKey } = await mustGetByKey<MasterKeys>('keys', user.id)
      encryptedKey = await rsa.wrapKey(cryptoKey!, publicKey)
    }

    // Create name with API
    type NameRequest = Omit<Assert<Name<true>, 'exists'>, 'id' | 'meta' | 'username'> & { meta: MetaPatch }
    const body: NameRequest = {
      firstName,
      lastName,
      privateDisplayName: privateDisplayName,
      displayName: name.displayName,
      visibility,
      meta: {
        cryptoKey: encryptedKey
      }
    }
    const res = await csfetch(route('/name'), {
      method: 'PUT',
      body: JSON.stringify(body)
    })
    if (res.status !== 200) {
      throw await HTTPerror(res, 'failed to submit name to server')
    }

    // Update local state and IDB
    const { meta }: StateResponse = await res.json()
    const final: Name = {
      exists: true,
      id: user.id,
      ...name,
      meta: {
        checksum: meta.checksum,
        cryptoKey
      }
    }
    this.set(final)
    await addToStore('user/name', final)
    this.initialized = true
    return user.id
  }

  /**
   * Register a unique, public username (if it's available).
   * Requires auth lvl 2.
   */
  async createUsername(username: string): Promise<void> {
    type UsernameReq = { username: string }

    const reqBody: UsernameReq = { username }
    const res = await csfetch(route('/username'), {
      method: 'POST',
      body: JSON.stringify(reqBody)
    })
    if (res.status !== 201) {
      throw await HTTPerror(res, 'Failed to create username')
    }
    const body: Username = await res.json()
    // Update name checksum
    this.update((store) => {
      if (store.exists) {
        store.username = body.username
        store.meta.checksum = body.meta!.checksum
      }
      return store
    })
    await addToStore('user/name', Store.get(this) as Assert<Name, 'exists'>)
  }

  /**
   * Delete the user's registered username.
   * Required auth lvl 2.
   */
  async deleteUsername(): Promise<void> {
    const res = await csfetch(route('/username'), {
      method: 'DELETE'
    })
    if (res.status !== 204) {
      throw await HTTPerror(res, 'Failed to delete username')
    }
    this.update((store) => {
      if (store.exists) {
        delete store.username
      }
      return store
    })
    await addToStore('user/name', Store.get(this) as Assert<Name, 'exists'>)
  }

  async delete(): Promise<void> {
    const res = await csfetch(route('/name'), {
      method: 'DELETE'
    })
    if (res.status !== 204) {
      throw await HTTPerror(res, 'Failed to delete name')
    }
  }
}

export const name = new NameStore()

export default name

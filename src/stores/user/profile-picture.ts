import { aes, rsa } from 'cs-crypto'
import { writable } from 'svelte/store'
import type { Readable, Writable } from 'svelte/store'
import { mustGetByKey } from '../../db'
import * as db from '../../db'
import { Visibilities, route, csfetch, HTTPerror } from '$lib'
import storage from '$db/storage'
import { pageStorage } from '$lib/page'
import { Store } from '../store'

export type UserPFP<E extends boolean = false> = PFPData & {
  exists: true
  id: string
  meta: UserPFPMeta<E>
} | {
  exists: false
}

export type UserPFPMeta<E extends boolean = false> = Omit<Meta<E>, 'cryptoKey'> & {
  cryptoKey?: Meta<E>['cryptoKey']
  visibility: import('$lib').Visibilities
  encoding: string
}

export type PFPData = {
  image: Blob
}

class UserPFPStore extends Store<UserPFP> {
  private initialized = false

  constructor() {
    super({
      exists: false
    })
  }

  async init(): Promise<void> {
    if (this.initialized) {
      return
    }

    const res = await csfetch(route('/profile-picture'))
    // If no PFP has been set for the user, nothing needs to be changed from initial state
    if (res.status === 204) {
      this.initialized = true
      return
    } else if (res.status !== 200) {
      throw await HTTPerror(res, 'Failed to initialize user PFP')
    }

    const meta: UserPFPMeta<true> = JSON.parse(res.headers.get('X-Image-Meta')!)
    // Use cache if checksums match
    const user = pageStorage.getJSON('user')!
    const cached = await db.getByKey<UserPFP>('user/profile-picture', user.id)
    if (cached != null && cached.exists && cached.meta.checksum === meta.checksum) {
      this.set(cached)
      this.initialized = true
      return
    }

    let image: Blob, encoding: string, cryptoKey: CryptoKey|undefined
    if (meta.visibility === Visibilities.Encrypted) {
      // Decrypt metadata
      const { privateKey } = await db.mustGetByKey<MasterKeys>('keys', user.id)
      cryptoKey = await rsa.unwrapKey(meta.cryptoKey!, privateKey, 'AES-GCM')
      encoding = await aes.decrypt(meta.encoding, cryptoKey)

      // Decrypt and decode the image itself
      const encrypted = new Uint8Array(await res.arrayBuffer())
      image = await aes.blobDecrypt(encrypted, cryptoKey, meta.encoding)
    } else {
      encoding = meta.encoding
      image = new Blob([new Uint8Array(await res.arrayBuffer())], {
        type: encoding
      })
    }

    // Update local state and cache
    const final: UserPFP = {
      exists: true,
      id: user.id,
      image,
      meta: {
        cryptoKey,
        checksum: meta.checksum,
        visibility: meta.visibility,
        encoding
      }
    }
    this.set(final)

    await db.addToStore('user/profile-picture', final)
    this.initialized = true
  }
}

function create(): Readable<UserPFP> & UserPFPStore {
  const initialState = {}
  const { subscribe, update }: Writable<UserPFP> = writable(initialState)

  return {
    async create(image: Blob, visibility: Visibilities): Promise<void> {
      const encoding = image.type

      let rawImage: Uint8Array
      let meta: UserPFPMeta
      const user = pageStorage.getJSON('user')!

      // Encrypt/encode the image depending on visibility
      if (visibility === Visibilities.Encrypted) {
        // Encrypt the image
        const key = await aes.generateKey('AES-GCM')
        rawImage = await aes.ABencrypt(await image.arrayBuffer(), key)

        // Wrap the cryptokey and encrypt image encoding info
        const { publicKey } = await mustGetByKey<MasterKeys>('keys', user.id)
        meta = {
          visibility,
          cryptoKey: await rsa.wrapKey(key, publicKey),
          encoding: await aes.encrypt(encoding, key)
        }
      } else {
        rawImage = new Uint8Array(await image.arrayBuffer())
        meta = {
          visibility,
          encoding
        }
      }

      // Store the encrypted data with the backend
      const contentType = visibility === Visibilities.Encrypted ? 'application/octet-stream' : encoding
      const res = await csfetch(route('/profile-picture'), {
        method: 'PUT',
        headers: {
          'CSRF-Token': storage.getCSRFtoken(),
          'Content-Type': contentType,
          'X-Image-Meta': JSON.stringify(meta)
        },
        body: rawImage.buffer
      })
      if (res.status !== 200) {
        if (res.status === 409) {
          throw new Error('a user profile picture has already been created')
        }
        try {
          const err: ErrorResponse = await res.json()
          throw new Error(err.message)
        } catch {
          throw new Error(`failed to create user profile picture (status ${res.status})`)
        }
      }
      const body: Legacy_Meta = await res.json()
      const checksum = body.meta.checksum

      // Update state
      update((store) => {
        store.image = image
        store.checksum = checksum
        store.visibility = visibility
        store.encoding = encoding
        return store
      })
    
      // Update IDB
      await db.addToStore('user-profile-picture', {
        id: user.id,
        image,
        checksum,
        visibility,
        encoding
      })
    }
  }
}


export const userPFP = create()

export default userPFP
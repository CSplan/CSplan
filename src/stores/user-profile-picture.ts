import { aes, rsa } from 'cs-crypto'
import userStore from './user'
import { get, Readable, Writable, writable } from 'svelte/store'
import { mustGetByKey } from '../db'
import { route } from '../core'
import * as db from '../db'
import { Visibilities } from '$lib'

const initialState = {
  exists: false
}

type UserPFPStore =  {
  init(): Promise<void>
  create(image: Blob, visibility: Visibilities): Promise<void>
}

function create(): Readable<UserPFP> & UserPFPStore {
  const { subscribe, update }: Writable<UserPFP> = writable(initialState)
  let initialized = false

  return {
    subscribe,
    async init() {
      if (initialized) {
        return
      }

      const res = await fetch(route('/profile-picture'), {
        method: 'GET',
        headers: {
          'CSRF-Token': localStorage.getItem('CSRF-Token')!
        }
      })
      // If no PFP has been set for the user, nothing needs to be changed from initial state
      if (res.status === 204) {
        initialized = true
        return
      } else if (res.status !== 200) {
        try {
          const err: ErrorResponse = await res.json()
          throw new Error(err.message)
        } catch {
          throw new Error(`failed to initialize user profile picture\n(status ${res.status})`)
        }
      }

  
      const meta: UserPFPMetaResponse = JSON.parse(res.headers.get('X-Image-Meta')!)
      // Use cache if checksums match
      const { user } = get(userStore)
      const cached: UserPFP = await db.getByKey('user-profile-picture', user.id)
      if (cached && cached.checksum === meta.checksum) {
        update((store) => {
          store.image = cached.image
          store.checksum = cached.checksum
          store.exists = true
          return store
        })
        initialized = true
        return
      }

      let image: Blob
      if (meta.visibility === Visibilities.Encrypted) {
        // Decrypt metadata
        const { privateKey } = <MasterKeys>(await db.mustGetByKey('keys', user.id))
        const key = await rsa.unwrapKey(meta.cryptoKey!, privateKey, 'AES-GCM')
        const encoding = await aes.decrypt(meta.encoding, key)

        // Decrypt and decode the image itself
        const encrypted = new Uint8Array(await res.arrayBuffer())
        image = await aes.blobDecrypt(encrypted, key, encoding)
      } else {
        image = new Blob([new Uint8Array(await res.arrayBuffer())], {
          type: meta.encoding
        })
      }

      // Update local state and cache
      update((store) => {
        store.image = image
        store.checksum = meta.checksum
        store.exists = true
        return store
      })

      await db.updateWithKey('user-profile-picture', {
        id: user.id,
        image,
        checksum: meta.checksum
      })
      initialized = true
    },

    async create(image: Blob, visibility: Visibilities): Promise<void> {
      const encoding = image.type

      let rawImage: Uint8Array
      let meta: UserPFPMeta
      let contentType: string
      const { user } = get(userStore)

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
        contentType = 'application/octet-stream'
      } else {
        rawImage = new Uint8Array(await image.arrayBuffer())
        meta = {
          visibility,
          encoding
        }
        contentType = encoding
      }

      // Store the encrypted data with the backend
      const res = await fetch(route('/profile-picture'), {
        method: 'PUT',
        headers: {
          'CSRF-Token': localStorage.getItem('CSRF-Token')!,
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
      const body: MetaResponse = await res.json()
      const checksum = body.meta.checksum

      // Update state
      update((store) => {
        store.image = image
        store.checksum = checksum
        store.exists = true
        return store
      })
    
      // Update IDB
      await db.addToStore('user-profile-picture', {
        id: user.id,
        image,
        checksum
      })
    }
  }
}


export const userPFP = create()

export default userPFP
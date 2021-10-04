import { aes, rsa } from 'cs-crypto'
import userStore from './user'
import { get, Readable, Writable, writable } from 'svelte/store'
import { mustGetByKey } from '../db'
import { route } from '../core'
import * as db from '../db'

const
  imageMetaHeader = 'X-Image-Meta',
  IDBname = 'user-profile-picture',
  initialState = {
    exists: false
  }

let initialized = false

function create(): Readable<UserPFP> & BasicStore<Blob> {
  const { subscribe, update }: Writable<UserPFP> = writable(initialState)

  return {
    subscribe,
    async init() {
      if (initialized) {
        return
      }

      const res = await fetch(route('/profile_picture'), {
        method: 'GET',
        headers: {
          'CSRF-Token': localStorage.getItem('CSRF-Token')!
        }
      })
      // If no PFP has been set for the user, nothing needs to be changed from initial state
      if (res.status === 404) {
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
      const meta: UserPFPMetaResponse = JSON.parse(res.headers.get(imageMetaHeader)!)

      // Use cache if checksums match
      const { user } = get(userStore)
      const cached: UserPFP = await db.getByKey(IDBname, user.id)
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


      // Decrypt metadata
      const { privateKey } = <MasterKeys>(await db.mustGetByKey('keys', user.id))
      const key = await rsa.unwrapKey(meta.cryptoKey, privateKey, 'AES-GCM')
      const encoding = await aes.decrypt(meta.encoding, key)

      // Decrypt and decode the image itself
      const encrypted = new Uint8Array(await res.arrayBuffer())
      const image = await aes.blobDecrypt(encrypted, key, encoding)

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

    async create(image: Blob): Promise<void> {
      const encoding = image.type
      // Encrypt the image
      const key = await aes.generateKey('AES-GCM')
      const { user } = get(userStore)
      const encrypted = await aes.ABencrypt(await image.arrayBuffer(), key)

      // Wrap the cryptokey and encrypt image encoding info
      const { publicKey } = await mustGetByKey<MasterKeys>('keys', user.id)
      const meta: UserPFPMeta = {
        cryptoKey: await rsa.wrapKey(key, publicKey),
        encoding: await aes.encrypt(encoding, key)
      }

      // Store the encrypted data with the backend
      const res = await fetch(route('/profile_picture'), {
        method: 'POST',
        headers: {
          'CSRF-Token': localStorage.getItem('CSRF-Token')!,
          'Content-Type': 'application/octet-stream',
          [imageMetaHeader]: JSON.stringify(meta)
        },
        body: encrypted.buffer
      })
      if (res.status !== 201) {
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
      await db.addToStore(IDBname, {
        id: user.id,
        image,
        checksum
      })
    }
  }
}


export const userPFP = create()

export default userPFP
import { writable, derived, get, Readable } from 'svelte/store'
import { route } from '$lib/route'
import { rsa, aes } from 'cs-crypto'
import { addToStore, deleteFromStore, getByKey, mustGetByKey, updateWithKey } from '../db'
import userStore from './user'
import { HTTPerror } from '$lib'
import storage from '$db/storage'

type Store = {
  [id: string]: Tag
}

let initialized = false

function create(): Readable<Store> & TagStore {
  const tagsStore: Store = {}
  const { subscribe, update } = writable(tagsStore)

  return {
    subscribe,
    async init(): Promise<void> {
      if (initialized) {
        return
      }
      // Fetch tags from API
      const res = await fetch(route('/tags'))
      if (res.status !== 200) {
        const err: ErrorResponse = await res.json()
        throw new Error(err.message || 'unknown error fetching tags')
      }
      const tags: TagDocument[] = await res.json()

      // Decrypt each tag not matching a cached checksum
      for (const tag of tags) {
        if (!tag.id) {
          continue
        }

        const cached = await getByKey<Tag>('tags', tag.id)
        if (cached != null && cached.checksum === tag.meta.checksum) {
          update((store: Store) => {
            store[tag.id] = { ...cached }
            return store
          })
          continue
        }

        // Decrypt the AES key
        const { user } = get(userStore)
        const { privateKey } = await mustGetByKey<MasterKeys>('keys', user.id)
        const cryptoKey = await rsa.unwrapKey(tag.meta.cryptoKey, privateKey)

        // Decrypt the tag body
        const raw = await aes.deepDecrypt({
          name: tag.name,
          color: tag.color
        }, cryptoKey) as TagData
        const decrypted: Tag = {
          id: tag.id,
          name: raw.name,
          color: raw.color,
          cryptoKey,
          checksum: tag.meta.checksum
        }

        await updateWithKey('tags', decrypted)
        update((store: Store) => {
          store[tag.id] = decrypted
          return store
        })
      }
      initialized = true
    },
    async create(tag: TagData) {
      if (typeof tag !== 'object') {
        throw new Error(`Expected type object, received type ${typeof tag}.`)
      }

      // Encrypt
      const cryptoKey = await aes.generateKey('AES-GCM')
      const { user } = get(userStore)
      const { publicKey } = await getByKey('keys', user.id) as unknown as MasterKeys
      const encrypted: TagData = await aes.deepEncrypt({
        name: tag.name,
        color: tag.color
      }, cryptoKey) as unknown as TagData

      // Store with API
      const document: TagDocument<MetaRequest> = {
        name: encrypted.name,
        color: encrypted.color,
        meta: {
          cryptoKey: await rsa.wrapKey(cryptoKey, publicKey)
        }
      }
      const res = await fetch(route('/tags'), {
        method: 'POST',
        body: JSON.stringify(document),
        headers: {
          'CSRF-Token': storage.getCSRFtoken(),
          'Content-Type': 'application/json'
        }
      })
      if (res.status !== 201) {
        const err: ErrorResponse = await res.json()
        throw new Error(err.message || 'unknown error creating tag')
      }
      const { id, meta }: MetaResponse = await res.json()

      // Update the tag with values from API
      const final: Tag = {
        ...tag,
        id,
        checksum: meta.checksum,
        cryptoKey
      }

      // Add to IDB and then store
      await addToStore('tags', final)
      update((store: Store) => {
        store[final.id] = final
        return store
      })

      return {
        id
      }
    },
    update(id: string, updates: Partial<Tag>) {
      update((store) => {
        const old = store[id]
        const final: Tag = {
          ...old,
          ...updates
        }
        store[id] = final
        return store
      })
    },
    async commit(id: string) {
      const tag = get(this)[id]
      if (tag == null) {
        throw new ReferenceError('Invalid ID passed, tag does not exist')
      }

      // Encrypt and commit to API
      const encrypted = await aes.deepEncrypt({
        name: tag.name,
        color: tag.color || '#FFFFFF' // TODO: tag color should be guaranteed, 
        // this guard is here because tag colors are not implemented and should be removed in the future
      }, tag.cryptoKey)
      const res = await fetch(route(`/tags/${id}`), {
        method: 'PATCH',
        headers: {
          'CSRF-Token': storage.getCSRFtoken(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(encrypted)
      })
      if (res.status !== 200) {
        throw new Error(await HTTPerror(res, 'Failed to update tag with server'))
      }
      const { meta }: MetaResponse = await res.json()
      tag.checksum = meta.checksum

      // Commit to IDB
      await updateWithKey('tags', tag)
      // Commit to local state
      update((store) => {
        store[id] = tag
        return store
      })
    },
    async delete(id) {
      const tag = get(this)[id]
      if (tag == null) {
        return
      }

      // Delete from API
      const res = await fetch(route(`/tags/${id}`), {
        method: 'DELETE',
        headers: {
          'CSRF-Token': storage.getCSRFtoken()
        }
      })
      if (res.status !== 204) {
        throw new Error(await HTTPerror(res, 'Failed to delete tag from server'))
      }

      // Delete from IDB
      await deleteFromStore('tags', id).catch((err) => {
        throw new Error(`Failed to delete from IndexedDB: ${err}`) // TODO: this is the standard of error reporting ALL stores should implement
      })
      // Delete from local state
      update((store) => {
        delete store[id]
        return store
      })
    }
  }
}

export const tags = create()

// TODO: implement tag indexes
export const ordered = derived(tags, ($tags) => {
  return Object.values($tags)
})

export default tags

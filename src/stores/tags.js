import { writable, derived, get } from 'svelte/store'
import route from '../route'
import '../../types/tags'
import { deepDecrypt, deepEncrypt, generateKey } from 'cs-crypto/lib/aes'
import { unwrapKey, wrapKey } from 'cs-crypto/lib/rsa'
import { addToStore, deleteFromStore, getByKey, updateWithKey } from '../db'

let initialized = false

function create() {
  const tagsStore = {}
  const { subscribe, update } = writable(tagsStore)

  return {
    subscribe,
    async init() {
      if (initialized) {
        return
      }
      // Fetch tags from API
      const res = await fetch(route('/tags'), {
        method: 'GET',
        headers: {
          'CSRF-Token': localStorage.getItem('CSRF-Token')
        }
      })
      const body = await res.json()
      if (res.status !== 200) {
        throw new Error(body.message)
      }

      // Decrypt each tag not matching a cached checksum
      for (const tag of body) {
        if (!tag.id) {
          continue
        }

        const cached = await getByKey('tags', tag.id)
        if (cached && cached.checksum === tag.meta.checksum) {
          update((store) => {
            store[tag.id] = { ...cached }
            return store
          })
          continue
        }

        // Decrypt the AES key
        const user = JSON.parse(localStorage.getItem('user'))
        const { privateKey } = await getByKey('keys', user.id)
        const cryptoKey = await unwrapKey('AES-GCM:'+tag.meta.cryptoKey, privateKey)
        const decrypted = {
          id: tag.id,
          ...await deepDecrypt({
            name: tag.name
          }, cryptoKey),
          cryptoKey,
          checksum: tag.meta.checksum
        }

        await updateWithKey('tags', decrypted)
        update((store) => {
          store[tag.id] = decrypted
          return store
        })
      }
      initialized = true
    },
    async create(tag) {
      if (typeof tag !== 'object') {
        throw new Error(`Expected type object, received type ${typeof tag}.`)
      }

      // Encrypt
      const key = await generateKey('AES-GCM')
      const user = JSON.parse(localStorage.getItem('user'))
      const publicKey = (await getByKey('keys', user.id)).publicKey
      const encrypted = {
        ...await deepEncrypt(tag, key),
        meta: {
          cryptoKey: (await wrapKey(key, publicKey)).split(':')[1]
        }
      }

      // Store with API
      const res = await fetch(route('/tags'), {
        method: 'POST',
        body: JSON.stringify(encrypted),
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': localStorage.getItem('CSRF-Token')
        }
      })
      /** @type {import('../../types/tags').TagResponse} */
      const body = await res.json()
      if (res.status !== 201) {
        throw new Error(body.message)
      }

      // Update the tag with values from API
      tag = {
        ...tag,
        id: body.id,
        cryptoKey: key,
        checksum: body.meta.checksum
      }

      // Add to IDB and then store
      await addToStore('tags', tag)
      update((store) => {
        store[tag.id] = tag
        return store
      })
    },
    update(id, tag) {
      update((store) => {
        const old = store[id]
        store[id] = {
          ...old,
          ...tag,
          uncommitted: 1 // Flag that there are pending changes
        }
        return store
      })
    },
    async commit(id) {
      let tag = get(this)[id]
      if (!tag) {
        throw new ReferenceError('Invalid ID passed, tag does not exist')
      }

      // Encrypt and commit to API
      const encrypted = {
        ...await deepEncrypt({
          name: tag.name,
          color: tag.color || '#FFFFFF' // TODO: tag color should be guaranteed, 
          // this guard is here because tag colors are not implemented and should be removed in the future
        }, tag.cryptoKey)
      }
      const res = await fetch(route(`/tags/${id}`), {
        method: 'PATCH',
        headers: {
          'CSRF-Token': localStorage.getItem('CSRF-Token'),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(encrypted)
      })
      const body = await res.json()
      if (res.status !== 200) {
        throw new Error(body.message)
      }
      tag = {
        ...tag,
        checksum: body.meta.checksum
      }
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
      if (!tag) {
        return
      }

      // Delete from API
      const res = await fetch(route(`/tags/${id}`), {
        method: 'DELETE',
        headers: {
          'CSRF-Token': localStorage.getItem('CSRF-Token')
        }
      })
      if (res.status !== 204) {
        const body = await res.json()
        throw new Error(body.message)
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

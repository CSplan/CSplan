import { writable } from 'svelte/store'
import route from '../route'
import '../../types/tags'
import { deepEncrypt, generateKey } from 'cs-crypto/lib/aes'
import { wrapKey } from 'cs-crypto/lib/rsa'
import { addToStore, getByKey } from '../db'

function create() {
  const tagsStore = {}
  const { subscribe, update } = writable(tagsStore)

  return {
    subscribe,
    async init() {
      // Fetch categories from API
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
      console.log(body)
    },
    async create(tag) {
      if (typeof tag !== 'object') {
        throw new Error(`Expected type object, received type ${typeof tag}.`)
      }

      // Encrypt
      const key = await generateKey('AES-GCM')
      const user = JSON.parse(localStorage.getItem('user'))
      const privateKey = await getByKey('keys', user.id)
      const encrypted = {
        ...await deepEncrypt(tag, key),
        meta: {
          cryptoKey: (await wrapKey(key, privateKey)).split(':')[1]
        }
      }

      // Store on API
      const res = await fetch(route('/tags'), {
        method: 'POST',
        body: encrypted,
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
    }
  }
}

export const tags = create()

export const ordered = Object.values(tags)

export default tags

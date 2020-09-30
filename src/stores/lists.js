import { writable, derived, get } from 'svelte/store'
import { route } from '../route'
import { getDB, addToStore, getByKey, updateWithKey, deleteFromStore } from '../db'
import { aes, rsa } from 'cs-crypto'
import { unwrapKey } from 'cs-crypto/lib/rsa'
import {  deepDecrypt } from 'cs-crypto/lib/aes'
const { generateKey, deepEncrypt } = aes
const { wrapKey } = rsa

function create() {
  const listStore = {}
  const { subscribe, update } = writable(listStore)

  return {
    subscribe,
    async init() {
      // Get all todo lists from the API
      let res = await fetch(route('/todos'), {
        method: 'GET',
        headers: {
          'CSRF-Token': localStorage.getItem('CSRF-Token'),
          'Content-Type': 'application/json'
        }
      })
      let body = await res.json()
      if (res.status !== 200) {
        throw new Error(body.message || 'Failed init.')
      }

      // Iterate through each list
      for (const list of body) {
        // See if the cache matches the list
        const cached = await getByKey('lists', list.id)
        if (cached && cached.checksum === list.meta.checksum) {
          // Add the cached version to state and continue
          await updateWithKey('lists', { ...cached, id: list.id, index: list.meta.index }) // Update our index
          update((store) => {
            store[list.id] = { ...cached, index: list.meta.index }
            return store
          })
          continue
        }

        // Decrypt the list's AES key
        const { id } = JSON.parse(localStorage.getItem('user'))
        const { privateKey } = await getByKey('keys', id)
        const cryptoKey = await unwrapKey('AES-GCM:'+list.meta.cryptoKey, privateKey)
        // Use the list's key to decrypt all information (and do some restructuring)
        const decrypted = {
          id: list.id,
          ...await deepDecrypt({
            title: list.title,
            items: list.items
          }, cryptoKey),
          cryptoKey,
          checksum: list.meta.checksum,
          index: list.meta.index
        }
        // Cache the decrypted list
        await updateWithKey('lists', decrypted)
        // Add to store
        update((store) => {
          store[list.id] = decrypted
          return store
        })
      }
    },
    async create(list) {
      // Validate the list
      if (typeof list !== 'object') {
        throw new TypeError(`Expected type object, received type ${typeof list}`)
      }

      // Get the user's ID
      const user = JSON.parse(localStorage.getItem('user'))
      // Get user's master public key
      const { publicKey } = await getByKey('keys', user.id)
      // Generate a new AES-256 key
      const key = await generateKey('AES-GCM')
      // Encrypt the list for storage
      const encrypted = {
        ...await deepEncrypt(list, key),
        meta: {
          cryptoKey: (await wrapKey(key, publicKey)).split(':')[1]
        }
      }

      // Store the encrypted list in the API
      const res = await fetch(route('/todos'), {
        method: 'POST',
        body: JSON.stringify(encrypted),
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': localStorage.getItem('CSRF-Token')
        }
      })
      const body = await res.json()
      if (res.status !== 201) {
        throw new Error(body.message || `Failed to create list with API (status ${res.status})`)
      }
    
      // Update the list with calculated values (also squash the meta out)
      list = { 
        ...list,
        id: body.id,
        index: body.meta.index,
        cryptoKey: key,
        checksum: body.meta.checksum 
      }

      // Add the list to IDB, then update the local state
      await getDB()
      await addToStore('lists', list)
      update((store) => {
        store[list.id] = list
        return store
      })

      // Required for SMSX compliance
      return {
        id: list.id
      }
    },
    async update(id, list) {
      update((store) => {
        const old = store[id]
        store[id] = {
          ...old,
          ...list,
          uncommitted: 1 // Flag that there are pending changes
        }
        return store
      })
    },
    async commit(id) {
      // Encrypt
      let list = get(this)[id]
      if (!list) {
        throw new ReferenceError('List passed by ID does not exist')
      }
      const encrypted = {
        ...await deepEncrypt({
          title: list.title,
          items: list.items
        }, list.cryptoKey),
        meta: {
          index: list.index
        }
      }

      // Commit
      const res = await fetch(route(`/todos/${id}`), {
        method: 'PATCH',
        body: JSON.stringify(encrypted),
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': localStorage.getItem('CSRF-Token')
        }
      })
      const body = await res.json()
      if (res.status !== 200) {
        throw new Error(body.message || `Failed to update list with API (status ${res.status})`)
      }

      // Update IDB and state with the new checksum
      list = {
        ...list,
        checksum: body.meta.checksum
      }
      delete list.uncommitted // Remove the unsaved flag
      await updateWithKey('lists', list)

      // Update the list's checksum
      update((store) => {
        store[id] = list
        return store
      })
    },
    async delete(id) {
      // Validate
      let list = get(this)[id]
      if (!list) {
        throw new ReferenceError('List passed by ID does not exist')
      }
      // Delete with API
      const res = await fetch(route(`/todos/${id}`), {
        method: 'DELETE',
        headers: {
          'CSRF-Token': localStorage.getItem('CSRF-Token')
        }
      })
      if (res.status !== 204) {
        const body = await res.json()
        throw new Error(body.message || 'Failed to delete todo list.')
      }

      // Delete from IDB
      await deleteFromStore('lists', id)
      // Delete from store
      update((store) => {
        delete store[id]
        return store
      })
    },
    async commitUnsaved() {
      const lists = get(ordered)
      for (const list of lists) {
        if (list.uncommitted) {
          await this.commit(list.id)
        }
      }
    },
    async move(id, index) {
      const oldIndex = get(this)[id].index
      const oldOrdered = get(ordered)
      // Validate the index
      if (index >= oldOrdered.length || index < 0 || index === oldIndex) {
        return
      }


      // Magic shifting calculations (see my svelte repl for detailed comments)
      if (index > oldIndex){
        for (let i = oldIndex; i <= index; i++) {
          await this.update(oldOrdered[i].id, { index: oldOrdered[i].index - 1 })
        }
      } else {
        for (let i = index; i < oldIndex; i++) {
          await this.update(oldOrdered[i].id, { index: oldOrdered[i].index + 1 })
        }
      }

      // Move the selected item to the new index
      await this.update(id, { index })
    }
  }
}

export const lists = create()

// Sort lists by the index property
export const ordered = derived(lists, ($lists) => {
  return Object.values($lists).sort((l1, l2) => l1.index - l2.index)
})

export default lists

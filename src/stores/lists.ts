import { writable, derived, get, Readable } from 'svelte/store'
import { addToStore, getByKey, addToStore, deleteFromStore, mustGetByKey } from '../db'
import { aes, rsa } from 'cs-crypto'
import { encryptList, decryptList } from './encryption'
import storage from '$db/storage'
import { FormStates, HTTPerror, route, csfetch } from '$lib'


type Store = {
  [id: string]: List
}

// Memoize init (init can safely be called when it's uncertain if the store is initialized without incurring wasted operations)
let initialized = false

function create(): Readable<Store> & ListStore {
  const listStore: Store = {}
  const { subscribe, update } = writable(listStore)

  return {
    subscribe,
    async init() {
      if (initialized) {
        return
      }
      // Get all todo lists from the API
      const res = await csfetch(route('/todos'), {
        method: 'GET',
        headers: {
          'CSRF-Token': storage.getCSRFtoken()!
        }
      })
      if (res.status !== 200) {
        let err: ErrorResponse
        try {
          err = await res.json()
        } catch {
          throw new Error('unable to load lists')
        }
        throw new Error(err.message || 'unable to load lists')
      }
      const lists: ListDocument[] = await res.json()
      // Iterate through each list
      for (const encrypted of lists) {
        if (!encrypted.id) {
          continue
        }
        // See if the cache matches the list
        const cached = await getByKey<List>('lists', encrypted.id)
        if (cached != null && cached.checksum === encrypted.meta.checksum) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`%cUsing cache for list ${encrypted.id}`, 'color: lightblue;')
          }
          // Add the cached version to state and continue
          await addToStore('lists', { ...cached, id: encrypted.id, index: encrypted.meta.index }) // Update our index
          update((store) => {
            // Clear any leftover flags
            cached.flags = {}
            store[encrypted.id] = { ...cached }
            return store
          })
          continue
        }

        // Decrypt the list's AES key
        const { id } = JSON.parse(localStorage.getItem('user')!)
        const { privateKey } = <MasterKeys><unknown>await getByKey('keys', id)
        const cryptoKey = await rsa.unwrapKey(encrypted.meta.cryptoKey, privateKey)

        // Decrypt title and items
        const data: ListData = await decryptList(encrypted, cryptoKey)

        // Use the list's key to decrypt all information (and do some restructuring)
        const list: List = {
          id: encrypted.id,
          ...data,
          index: encrypted.meta.index,
          checksum: encrypted.meta.checksum,
          cryptoKey
        }
        // Cache the decrypted list
        await addToStore('lists', list)
        // Add to store
        update((store: Store) => {
          store[list.id] = list
          return store
        })
      }
      initialized = true
    },
    async create(list: ListData) {
      // Validate the list
      if (typeof list !== 'object') {
        throw new TypeError(`Expected type object, received type ${typeof list}`)
      }

      // Get the user's ID
      const user = JSON.parse(localStorage.getItem('user')!)
      // Get user's master public key
      const { publicKey } = await mustGetByKey<{ publicKey: CryptoKey }>('keys', user.id)
      // Generate a new AES-256 key
      const cryptoKey = await aes.generateKey('AES-GCM')
      
      // Encrypt the list
      const encrypted: EncryptedListData = await encryptList(list, cryptoKey)

      // Encrypt and format the list for storage
      const document: ListDocument<MetaRequest> = {
        title: encrypted.title,
        items: encrypted.items,
        meta: {
          cryptoKey: await rsa.wrapKey(cryptoKey, publicKey)
        }
      }

      // Store the encrypted list in the API
      const res = await csfetch(route('/todos'), {
        method: 'POST',
        body: JSON.stringify(document),
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': storage.getCSRFtoken()
        }
      })
      if (res.status !== 201) {
        throw new Error(await HTTPerror(res, 'Failed to create list with server'))
      }
      const { id, meta }: IndexedMetaResponse = await res.json()
    
      // Update the list with server generated values
      const final: List = {
        ...list,
        id,
        index: meta.index,
        checksum: meta.checksum,
        cryptoKey
      }

      // Add the list to IDB, then update the local state
      await addToStore('lists', final)
      update((store: Store) => {
        store[id] = final
        return store
      })

      // Required for SMSX compliance
      return {
        id
      }
    },
    update(id: string, updates: Partial<List>) {
      update((store: Store) => {
        const old = store[id]
        const final: List = {
          ...old,
          ...updates
        }
        store[id] = final
        return store
      })
    },
    async commit(id: string) {
      // Encrypt
      const list: List = (<Store>get(this))[id]
      if (list == null) {
        throw new ReferenceError('List passed by ID does not exist')
      }

      // Flag the list as saving if the commit operations lasts for more than 500ms
      const savingFlagTimeout = setTimeout(() => {
        update((store: Store) => {
          store[id].flags = {
            saveState: FormStates.Saving
          }
          return store
        })
      }, 500)

      // Encrypt the entire list and send the changes as a PATCH request
      // TODO: use flags.changes to make more precise and efficient patches
      const encrypted: EncryptedListData = await encryptList(list, list.cryptoKey)
      const document: ListDocument<IndexedMetaUpdate> = {
        title: encrypted.title,
        items: encrypted.items,
        meta: {
          index: list.index
        }
      }

      // Commit
      const res = await csfetch(route(`/todos/${id}`), {
        method: 'PATCH',
        body: JSON.stringify(document),
        headers: {
          'CSRF-Token': storage.getCSRFtoken(),
          'Content-Type': 'application/json'
        }
      })
      clearTimeout(savingFlagTimeout)
      if (res.status !== 200) {
        const err: ErrorResponse = await res.json()
        throw new Error(err.message || `Failed to update list with API (status ${res.status})`)
      }
      // Set the list's state as saved, set a timeout to clear this state after 500ms
      update((store: Store) => {
        store[id].flags = {
          saveState: FormStates.Saved
        }
        return store
      })
      setTimeout(() => {
        update((store: Store) => {
          delete store[id].flags?.saveState
          return store
        })
      }, 500)

      // Update the list's checksum
      const { meta }: IndexedMetaResponse = await res.json()
      const final: List = {
        ...list,
        checksum: meta.checksum
      }
      await addToStore('lists', final)

      // Update the list's checksum
      update((store: Store) => {
        store[id] = final
        return store
      })
    },
    async delete(id: string) {
      // Validate
      const list: List|null = get(this)[id]
      if (list == null) {
        return
      }
      // Delete with API
      const res = await csfetch(route(`/todos/${id}`), {
        method: 'DELETE',
        headers: {
          'CSRF-Token': storage.getCSRFtoken()
        }
      })
      if (res.status !== 204) {
        throw new Error(await HTTPerror(res, 'Failed to delete list with server'))
      }

      // Delete from IDB
      await deleteFromStore('lists', id)
      // Delete from store
      update((store: Store) => {
        delete store[id]
        return store
      })
    },
    async commitUnsaved() {
      const lists = <List[]>get(ordered)
      for (const list of lists) {
        if (list.flags != null && list.flags.uncommitted) {
          await this.commit(list.id)
        }
      }
    },
    async move(id: string, index: number): Promise<void> {
      const oldIndex = (<Store>get(this))[id].index
      const oldOrdered = <List[]>get(ordered)
      // Validate the index
      if (index >= oldOrdered.length || index < 0 || index === oldIndex) {
        return
      }

      // Magic shifting calculations (see this svelte repl for detailed comments) - https://svelte.dev/repl/b086c8cc851045d59c948e08786c40be?version=3.42.4
      const IDBupdates: List[] = []
      if (index > oldIndex){
        for (let i = oldIndex; i <= index; i++) {
          oldOrdered[i].index -= 1
          this.update(oldOrdered[i].id, { index: oldOrdered[i].index })
          IDBupdates.push(oldOrdered[i])
        }
      } else {
        for (let i = index; i < oldIndex; i++) {
          oldOrdered[i].index += 1
          this.update(oldOrdered[i].id, { index: oldOrdered[i].index })
          IDBupdates.push(oldOrdered[i])
        }
      }

      // Move the selected item to the new index
      this.update(id, { index })

      // Fulfill IDBupdates
      for (const list of IDBupdates) {
        await addToStore('lists', list)
      }
    }
  }
}

export const lists = create()

// Sort lists by the index property
export const ordered = derived(lists, ($lists) => {
  return Object.values($lists).sort((l1, l2) => l1.index - l2.index)
})

// The total number of items
export const itemsTotal = derived(lists, ($lists) => {
  return Object.values($lists).reduce((prev, v) => prev + v.items.length, 0)
})

export default lists

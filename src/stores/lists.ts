import { writable, derived, get, Readable } from 'svelte/store'
import { route } from '../route'
import { addToStore, getByKey, updateWithKey, deleteFromStore } from '../db'
import { aes, rsa } from 'cs-crypto'

// Encrypted lists
type EncryptedListPartial = {
  title: Encrypted
  items: EncryptedItem[]
  meta?: {
    index?: number
    cryptoKey?: Encrypted
  }
}
type EncryptedListMeta = {
  id: string
  meta: {
    index: number
    cryptoKey: Encrypted|undefined // 201 responses will not contain cryptoKey
    checksum: string
  }
}
type EncryptedList = EncryptedListPartial & EncryptedListMeta
type EncryptedItem = {
  title: Encrypted
  description: Encrypted
  done: Encrypted
  tags: Encrypted[]
}

// Unencrypted lists
type ListPartial = {
  title: string
  items: Item[]
}
// ListPartial derivative used for update actions
type ListUpdate = {
  title?: string
  items?: Item[]
  index?: number
}
type ListMeta = {
  id: string
  index: number
  cryptoKey: CryptoKey
  checksum: string
}
// Local flags to assist with state management
type ListFlags = {
  flags?: {
    uncommitted?: boolean
  }
}
// Lists as stored in IDB and state
export type List = ListPartial & ListMeta & ListFlags
type Item = {
  title: string
  description: string
  done: Encrypted|boolean
  tags: string[]
}

type Store = {
  [id: string]: List
}

// Memoize init (init can safely be called when it's uncertain if the store is initialized without incurring wasted operations)
let initialized = false

function create(): Readable<Store> & SMSXStore{
  const listStore = {}
  const { subscribe, update } = writable(listStore)

  return {
    subscribe,
    async init() {
      if (initialized) {
        return
      }
      // Get all todo lists from the API
      const res = await fetch(route('/todos'), {
        method: 'GET',
        headers: {
          'CSRF-Token': localStorage.getItem('CSRF-Token')!,
          'Content-Type': 'application/json'
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
      const lists: EncryptedList[] = await res.json()
      // Iterate through each list
      for (const list of lists) {
        if (!list.id) {
          continue
        }
        // See if the cache matches the list
        const cached = <List>await getByKey('lists', list.id)
        if (cached && cached.checksum === list.meta.checksum) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`%cUsing cache for list ${list.id}`, 'color: lightblue;')
          }
          // Add the cached version to state and continue
          await updateWithKey('lists', { ...cached, id: list.id, index: list.meta.index }) // Update our index
          update((store: Store) => {
            store[list.id] = { ...cached }
            return store
          })
          continue
        }

        // Decrypt the list's AES key
        const { id } = JSON.parse(localStorage.getItem('user')!)
        const { privateKey } = <MasterKeys><unknown>await getByKey('keys', id)
        const cryptoKey = await rsa.unwrapKey(list.meta.cryptoKey!, privateKey)
        // Use the list's key to decrypt all information (and do some restructuring)
        const decrypted: List = {
          id: list.id,
          ...<ListPartial><unknown>(await aes.deepDecrypt({
            title: list.title,
            items: list.items
          }, cryptoKey)),
          index: list.meta.index,
          checksum: list.meta.checksum,
          cryptoKey
        }
        // Cache the decrypted list
        await updateWithKey('lists', decrypted)
        // Add to store
        update((store: Store) => {
          store[list.id] = decrypted
          return store
        })
      }
      initialized = true
    },
    async create(list: ListPartial) {
      // Validate the list
      if (typeof list !== 'object') {
        throw new TypeError(`Expected type object, received type ${typeof list}`)
      }

      // Get the user's ID
      const user = JSON.parse(localStorage.getItem('user')!)
      // Get user's master public key
      const { publicKey } = <MasterKeys><unknown>await getByKey('keys', user.id) // TODO: fix unideal casting
      // Generate a new AES-256 key
      const cryptoKey = await aes.generateKey('AES-GCM')
      // Encrypt and format the list for storage
      const encrypted: EncryptedListPartial = {
        ...<EncryptedListPartial><unknown>(await aes.deepEncrypt({
          title: list.title,
          items: list.items
        }, cryptoKey)),
        meta: {
          cryptoKey: await rsa.wrapKey(cryptoKey, publicKey)
        }
      }

      // Store the encrypted list in the API
      const res = await fetch(route('/todos'), {
        method: 'POST',
        body: JSON.stringify(encrypted),
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': localStorage.getItem('CSRF-Token')!
        }
      })
      if (res.status !== 201) {
        const err: ErrorResponse = await res.json()
        throw new Error(err.message || `failed to create list with API (status ${res.status})`)
      }
      const { id, meta }: EncryptedListMeta = await res.json()
    
      // Update the list with server generated values
      const final: List = {
        ...list,
        id,
        index: meta.index,
        checksum: meta.checksum,
        cryptoKey
      }
      console.log(list, final)

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
    update(id: string, updates: ListUpdate) {
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
      const list = (<Store>get(this))[id]
      if (!list) {
        throw new ReferenceError('List passed by ID does not exist')
      }

      // Encrypt the entire list and send the changes as a PATCH request
      // TODO: use flags.changes to make more precise and efficient patches
      const encrypted: EncryptedListPartial = {
        ...<EncryptedListPartial><unknown>(await aes.deepEncrypt({
          title: list.title,
          items: list.items
        }, list.cryptoKey)),
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
          'CSRF-Token': localStorage.getItem('CSRF-Token')!
        }
      })
      if (res.status !== 200) {
        const err: ErrorResponse = await res.json()
        throw new Error(err.message || `Failed to update list with API (status ${res.status})`)
      }
      const { meta }: EncryptedListMeta = await res.json()

      // Update the list's checksum
      // Remove uncommitted flag
      if (list.flags) {
        delete list.flags.uncommitted
      }
      const final: List = {
        ...list,
        checksum: meta.checksum
      }
      await updateWithKey('lists', final)

      // Update the list's checksum
      update((store: Store) => {
        store[id] = final
        return store
      })
    },
    async delete(id: string) {
      // Validate
      const list = (<Store>get(this))[id]
      if (!list) {
        return
      }
      // Delete with API
      const res = await fetch(route(`/todos/${id}`), {
        method: 'DELETE',
        headers: {
          'CSRF-Token': localStorage.getItem('CSRF-Token')!
        }
      })
      if (res.status !== 204) {
        const err = await res.json()
        throw new Error(err.message || 'Failed to delete todo list.')
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
        if (list.flags && list.flags.uncommitted) {
          await this.commit(list.id)
        }
      }
    },
    async move(id: string, index: number): Promise<void> {
      const oldIndex = (<Store>get(this))[id].index
      const oldOrdered = <List[]>get(ordered)
      // Validate the index
      console.log(oldIndex, index)
      if (index >= oldOrdered.length || index < 0 || index === oldIndex) {
        return
      }


      // Magic shifting calculations (see my svelte repl for detailed comments)
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
        await updateWithKey('lists', list)
      }
    }
  }
}

export const lists = create()

// Sort lists by the index property
export const ordered = derived(lists, ($lists: Store) => {
  return Object.values($lists).sort((l1, l2) => l1.index - l2.index)
})

export default lists

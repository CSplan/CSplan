import { derived } from 'svelte/store'
import * as db from '$db'
import { aes, rsa } from 'cs-crypto'
import { encryptList, decryptList } from '../encryption'
import { HTTPerror, route, csfetch, FormStates } from '$lib'
import { Store } from '../store'
import { pageStorage } from '$lib/page'
import { titleViewMeta } from './titleview-meta'

export type List<E extends boolean = false> = ListData<E> & {
  id: string
  meta: ListMeta<E>
}

export type ListMeta<E extends boolean = false> = OrderedMeta<E> & {
  reverseItems: E extends true ? string : boolean
  archived: boolean
} & Partial<{
  saveState: FormStates
}>

export type ListData<E extends boolean = false> = {
  title: string
  items: ListItem<E>[]
}

export type ListItem<E extends boolean = false> = {
  title: string
  description: string
  done: E extends true ? string : boolean
  tags: string[]
}

type ListRequest = Omit<List<true>, 'id' | 'meta'> & { 
  meta: Required<MetaPatch> & Pick<ListMeta<true>, 'reverseItems'>
}
type ListPatch = Omit<Partial<List<true>>, 'id' | 'meta'> & { meta?: Partial<Pick<ListMeta<true>, 'index' | 'reverseItems' | 'archived'>> }

class ListStore extends Store<Record<string, List>> {
  private initialized = false
  private archivedInitialized = false
  declare update: Store<Record<string, List>>['update']

  constructor() {
    super({})
  }

  async init(this: ListStore, filter: 'archived' | 'unarchived' | 'all' = 'unarchived'): Promise<void> {
    if (this.initialized && filter === 'unarchived') {
      return
    }
    if (this.archivedInitialized) {
      return
    }
    // Get all todo lists from the API, applying a filter is one is provided
    const res = await csfetch(route('/todos' + (filter != null ? `?filter=${filter}` : '')))
    if (res.status !== 200) {
      throw await HTTPerror(res, 'Failed to fetch lists')
    }
    const lists: List<true>[] = await res.json()
    // Iterate through each list
    for (const encrypted of lists) {
      // See if the cache matches the list
      const cached = await db.getByKey<List>('lists', encrypted.id)
      if (cached != null && cached.checksum === encrypted.meta.checksum) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`%cUsing cache for list ${encrypted.id}`, 'color: lightblue;')
        }
        // Add the cached version to state and continue
        this.update((store) => {
          store[cached.id] = cached
          return store
        })
        continue
      }

      // Decrypt the list's AES key
      const user = pageStorage.getJSON('user')!
      const { privateKey } = await db.mustGetByKey<MasterKeys>('keys', user.id)
      const cryptoKey = await rsa.unwrapKey(encrypted.meta.cryptoKey, privateKey)

      // Use the list's key to decrypt all information (and do some restructuring)
      const list: List = {
        id: encrypted.id,
        ...await decryptList(encrypted, cryptoKey), // Decrypt title and items
        meta: {
          index: encrypted.meta.index,
          checksum: encrypted.meta.checksum,
          reverseItems: (await aes.decrypt(encrypted.meta.reverseItems, cryptoKey)) === 'true',
          archived: encrypted.meta.archived,
          cryptoKey
        }
      }
      // Cache the decrypted list
      await db.addToStore('lists', list)
      // Add to store
      this.update((store) => {
        store[list.id] = list
        return store
      })
    }
    this.initialized = true
    if (filter !== 'unarchived') {
      this.archivedInitialized = true
    }
  }

  async create(list: ListData): Promise<string> {
    // Get the user's ID
    const user = pageStorage.getJSON('user')!
    // Get user's master public key
    const { publicKey } = await db.mustGetByKey<MasterKeys>('keys', user.id)
    // Generate a new AES key
    const cryptoKey = await aes.generateKey('AES-GCM')
    
    // Encrypt the list
    const encrypted = await encryptList(list, cryptoKey)

    // Encrypt and format the list for storage
    const body: ListRequest = {
      title: encrypted.title,
      items: encrypted.items,
      meta: {
        reverseItems: await aes.encrypt('false', cryptoKey),
        cryptoKey: await rsa.wrapKey(cryptoKey, publicKey)
      }
    }

    // Store the encrypted list in the API
    const res = await csfetch(route('/todos'), {
      method: 'POST',
      body: JSON.stringify(body)
    })
    if (res.status !== 201) {
      throw await HTTPerror(res, 'Failed to create list with server')
    }
    const { id, meta }: OrderedStateResponse = await res.json()
  
    // Update the list with server generated values
    const final: List = {
      id,
      ...list,
      meta: {
        index: meta.index,
        checksum: meta.checksum,
        reverseItems: false,
        archived: false,
        cryptoKey
      }
    }

    // Add the list to IDB, then update the local state
    await db.addToStore('lists', final)
    this.update((store) => {
      store[id] = final
      return store
    })

    // Required for SMSX compliance
    return id
  }

  async commit(id: string): Promise<void> {
    // Encrypt
    const list: List = Store.get(this)[id]
    if (list == null) {
      throw new ReferenceError('List passed by ID does not exist')
    }

    // Flag the list as saving if the commit operation lasts for more than 500ms
    const savingFlagTimeout = setTimeout(() => {
      this.update((store) => {
        store[id].meta.saveState = FormStates.Saving
        return store
      })
    }, 500)

    // Encrypt the entire list and send the changes as a PATCH request
    // TODO: use flags.changes to make more precise patches
    const encrypted  = await encryptList(list, list.meta.cryptoKey)
    const body: ListPatch = {
      title: encrypted.title,
      items: encrypted.items,
      meta: {
        index: list.meta.index,
        reverseItems: await aes.encrypt(`${list.meta.reverseItems}`, list.meta.cryptoKey),
        archived: list.meta.archived
      }
    }

    // Commit
    const res = await csfetch(route(`/todos/${id}`), {
      method: 'PATCH',
      body: JSON.stringify(body)
    })
    clearTimeout(savingFlagTimeout)
    if (res.status !== 200) {
      throw await HTTPerror(res, 'Failed to update list')
    }

    // Set the list's state as saved, clear after 500ms
    this.update((store) => {
      store[id].meta.saveState = FormStates.Saved
      return store
    })
    setTimeout(() => {
      this.update((store) => {
        delete store[id].meta.saveState
        return store
      })
    }, 500)

    // Update the list's checksum
    const { meta }: OrderedStateResponse = await res.json()
    list.meta.checksum = meta.checksum
    this.update((store) => {
      store[id] = list
      return store
    })
    await db.addToStore('lists', list)
  }

  async delete(this: ListStore, id: string): Promise<void> {
    // Validate
    const list = Store.get(this)[id]
    if (list == null) {
      return
    }
    // Delete with API
    const res = await csfetch(route(`/todos/${id}`), {
      method: 'DELETE'
    })
    if (res.status !== 204) {
      throw await HTTPerror(res, 'Failed to delete list')
    }

    // Delete from IDB
    await db.deleteFromStore('lists', id)
    // Delete from store
    this.update((store) => {
      delete store[id]
      return store
    })
  }

  /** Archive a list */
  async archive(id: string, unarchive = false): Promise<void> {
    const body: ListPatch = {
      meta: {
        archived: !unarchive
      }
    }
    this.update((store) => {
      store[id].meta.archived = !unarchive
      store[id].meta.saveState = FormStates.Saving
      return store
    })
    const res = await csfetch(route(`/todos/${id}`), {
      method: 'PATCH',
      body: JSON.stringify(body)
    })
    if (res.status !== 200) {
      throw await HTTPerror(res, 'Failed to archive list')
    }
    // Set the list's state as saved, clear after 500ms
    this.update((store) => {
      store[id].meta.saveState = FormStates.Saved
      return store
    })
    setTimeout(() => {
      this.update((store) => {
        delete store[id].meta.saveState
        return store
      })
    }, 500)
  }

  /** Unarchive a list */
  async unarchive(id: string): Promise<void> {
    return this.archive(id, true)
  }

  async move(id: string, index: number): Promise<void> {
    // Get ordered state
    const state = Store.get(ordered)
    const max = state.length > 0 ? state[state.length-1].meta.index : 0
    // Validate move destination
    if (index > max) {
      throw new Error('Destination index exceeds list length')
    }

    // New and old positions
    const n = index
    let o: number|null = null
    // Create a map of index (original) -> id
    const indexMap = new Map<number, string>()
    for (const list of state) {
      const i = list.meta.index
      indexMap.set(i, list.id)
      if (list.id === id) {
        o = i
      }
    }
    if (o === null) {
      throw new Error('Non-existent id passed')
    }

    // Move o -> max+1
    this.update((store) => {
      store[id].meta.index = state.length
      return store
    })


    if (n > o) {
      // move (o, n] -1
      for (let i = o+1; i <= n; i++) {
        this.update((store) => {
          const lid = indexMap.get(i)
          if (lid) {
            store[lid].meta.index--
          }
          return store
        })
      }
    } else if (n < o) {
      // move [n, o) +1
      for (let i = o-1; i >= n; i--) {
        this.update((store) => {
          const lid = indexMap.get(i)
          if (lid) {
            store[lid].meta.index++
          }
          return store
        })
      }
    }

    // move o -> n
    this.update((store) => {
      store[id].meta.index = n
      return store
    })

    // Commit changes
    const res = await csfetch(route(`/todos/${id}`), {
      method: 'PATCH',
      body: JSON.stringify({
        meta: {
          index: n
        }
      })
    })
    if (res.status !== 200) {
      throw await HTTPerror(res, `Failed to commit index movement of list ${id} to index ${n}`)
    }
  }
}


export const lists = new ListStore()

// Sort lists by the index property
export const ordered = derived([lists, titleViewMeta], ([$lists, $meta]) => {
  return Object.values($lists).filter(v => $meta.showArchived || !v.meta.archived)
    .sort((l1, l2) => $meta.reverseLists
      ? l2.meta.index - l1.meta.index
      : l1.meta.index - l2.meta.index)
})

// The total number of items
export const itemsTotal = derived(lists, ($lists) => {
  return Object.values($lists).reduce((prev, v) => prev + v.items.length, 0)
})

// Items for each list, may be reversed based on per-list metadata
export const items = derived(lists, ($lists) => {
  return Object.values($lists).reduce<Record<string, ListItem[]>>((prev, v) => {
    prev[v.id] = v.meta.reverseItems ? [...v.items].reverse() : v.items
    return prev
  }, {})
})

export default lists

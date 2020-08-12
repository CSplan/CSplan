import { writable, derived } from 'svelte/store'
import { getDB, addToStore } from '../db'

function create() {
  const listStore = {}
  const { subscribe, update } = writable(listStore)

  return {
    subscribe,
    async addList(list) {
      update((store) => {
        const newStore = store
        newStore[list.id] = list
        return newStore
      })
      await getDB()
      await addToStore('lists', list)
    },
    async updateList(list) {
      update((store) => {
        const newStore = store
        newStore[list.id] = list
        return newStore
      })
      const db = await getDB()
      const store = db.transaction('lists', 'readwrite').objectStore('lists')
      store.put(list)
    } 
  }
}

export const lists = create()

export const ordered = derived(lists, $lists => Object.values($lists))

export default lists

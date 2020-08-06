import { writable } from 'svelte/store'
import { getDB, clearStore } from '../db'

function create() {
  const userStore = {
    user: {
      id: '',
      email: ''
    },
    isLoggedIn: false
  }
  const { subscribe, update, set } = writable(userStore)

  return {
    subscribe,
    login(user) {
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('isLoggedIn', 'true')
      update(store => ({ ...store, user, isLoggedIn: true }))
    },
    async logout() {
      // Clear localstorage
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('user')
      localStorage.removeItem('CSRF-Token')
      // Clear IDB
      await getDB()
      clearStore('keys')
      // Reset in-memory state
      set(userStore)
    }
  }
}

export default create()

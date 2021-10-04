import { Readable, writable } from 'svelte/store'
import { clearAll, clearUserStores } from '../db'

export type UserStore = {
  user: {
    id: string
    email: string
  }
  isLoggedIn: boolean
}

type UserActions = {
  login(user: UserStore['user']): void
  logout(): void
}

// This store ONLY manages local state, all API interaction must be handled by components before calling these functions
// TODO: this flow is stupid
function create(): Readable<UserStore> & UserActions {
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
    login(user: UserStore['user']) {
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('isLoggedIn', 'true')
      update(store => ({ ...store, user, isLoggedIn: true }))
    },
    async logout() {
      await clearUserStores()
      // Clear localstorage
      localStorage.clear()
      // Clear IDB
      await clearAll()
      // Reset in-memory state
      set(userStore)
    }
  }
}

export default create()

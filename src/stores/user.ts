import { Readable, writable } from 'svelte/store'
import { clearAll, clearUserStores } from '../db'
import { HTTPerror, route, csfetch } from '$lib'
import storage from '$db/storage'


type UserActions = {
  login(user: UserStore['user']): void
  logout(): void
}

function create(): Readable<UserStore> & UserActions {
  const userStore = {
    user: {
      id: '',
      email: '',
      verified: false
    },
    isLoggedIn: false
  }
  const { subscribe, set } = writable(userStore)

  return {
    subscribe,
    login(user: UserStore['user']) {
      storage.setUser(user)
      localStorage.setItem('isLoggedIn', 'true')
      set({ user, isLoggedIn: true })
    },
    async logout(informAPI = true) {
      if (informAPI) {
        const res = await csfetch(route('/logout'), {
          method: 'POST',
          headers: {
            'CSRF-Token': storage.getCSRFtoken()
          }
        })
        if (res.status !== 204) {
          console.error(await HTTPerror(res, 'Failed to log out from API'))
        }
      }
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

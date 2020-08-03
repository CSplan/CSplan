import { writable } from 'svelte/store'

function create () {
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
    login (user) {
      update(store => ({ ...store, user, isLoggedIn: true }))
    },
    logout () {
      set(userStore)
    }
  }
}

export default create()

import { Store } from './store'
import { clearAll } from '../db'
import { HTTPerror, route, csfetch } from '$lib'
import AccountTypes from '$lib/account-types'

export type User = {
  isLoggedIn: true
  id: string
  email: string
  verified: boolean
  accountType: AccountTypes
} | {
  isLoggedIn: false
}

class UserStore extends Store<User> {
  declare set: Store<User>['set']
  declare update: Store<User>['update']

  constructor() {
    super({
      isLoggedIn: false
    })
  }

  async logout(this: UserStore): Promise<void> {
    const res = await csfetch(route('/logout'), {
      method: 'POST'
    })
    if (res.status !== 204) {
      console.error(await HTTPerror(res, 'Failed to log out from API.'))
    }
    // Clear IDB and localstorage
    await clearAll()
    localStorage.clear()
    // Reset in-memory state
    this.set(this.initialValue) 
  }

  async sendVerificationEmail(): Promise<void> {
    const res = await csfetch(route('/send-verification-email'), {
      method: 'POST'
    })
    if (res.status !== 204) {
      throw new Error(await HTTPerror(res, 'Failed to send verification email.'))
    }
  }
}

export const user = new UserStore()

export default user
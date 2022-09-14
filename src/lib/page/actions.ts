import { csfetch } from '$lib/csfetch'
import { HTTPerror } from '$lib/error-format'
import { route } from '$lib/route'
import { clearAll } from '$db/index'
import { goto, invalidateAll } from '$app/navigation'

export const userActions = {
  async logout(): Promise<void> {
    const res = await csfetch(route('/logout'), {
      method: 'POST'
    })
    if (res.status !== 204) {
      throw await HTTPerror(res, 'Failed to log out from API.')
    }
    // Clear IDB and localstorage
    await clearAll()
    localStorage.clear()
    // Redirect to home
    await goto('/', {
      replaceState: true
    })
    // Invalidate state
    await invalidateAll()
  },
  async sendVerificationEmail(): Promise<void> {
    const res = await csfetch(route('/send-verification-email'), {
      method: 'POST'
    })
    if (res.status !== 204) {
      throw await HTTPerror(res, 'Failed to send verification email.')
    }
  }
}
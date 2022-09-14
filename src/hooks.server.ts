import type { Handle } from '@sveltejs/kit'
import type AccountTypes from '$lib/account-types'
import { HTTPerror, route } from '$lib'
import { dev } from '$app/environment'

type AuthorizedResponse = {
  userID: string
  sessionID: string
  email: string
  verified: boolean
  accountType: AccountTypes
  authLevel: number
}

// Create a full URL for use in SSR requests
function serverRoute(path: string): string {
  return dev ? `http://${process.env.CSPLAN_HOSTNAME}:3000` + path : route(path)
}

// Get user appearance settings
async function getSettings(authCookie: string): Promise<App.Locals['settings']|undefined> {
  const res = await fetch(serverRoute('/settings?filter=appearance'), {
    headers: {
      // Cookies have to manually be passed in serverside fetch requests
      Cookie: `Authorization=${authCookie}`
    }
  })
  if (res.status !== 200) {
    return
  }
  return res.json()
}

// Get user payment status
async function getPaymentStatus(authCookie: string): Promise<App.Locals['paymentStatus']|undefined> {
  const res = await fetch(serverRoute('/payment-status'), {
    headers: {
      Cookie: `Authorization=${authCookie}`
    }
  })
  if (res.status !== 200) {
    return
  }
  return res.json()
}

// Get user and session info
async function getUser(authCookie: string): Promise<App.Locals['user']> {
  const res = await fetch(serverRoute('/whoami'), {
    headers: {
      Cookie: `Authorization=${authCookie}`
    }
  })
  if (res.status !== 200) {
    throw await HTTPerror(res, 'Failed backend authentication.')
  }

  const body: AuthorizedResponse = await res.json() // API responses have no 'isLoggedIn' property
  return {
    id: body.userID,
    email: body.email,
    verified: body.verified,
    accountType: body.accountType,
    authLevel: body.authLevel
  }
}


// Serverside request hook, used to fetch SSR data
export const handle: Handle = async ({ event, resolve }) => {
  // If an authorization cookie is present, assume the user is logged in
  const authCookie = event.cookies.get('Authorization')
  event.locals.isLoggedIn = authCookie != null && authCookie.length > 0

  if (authCookie != null && authCookie.length > 0) {
    try {
      event.locals.isLoggedIn = true
      event.locals.user = await getUser(authCookie)
      event.locals.settings = await getSettings(authCookie) || {
        darkMode: event.cookies.get('DarkMode') !== 'false'
      }
      event.locals.paymentStatus = await getPaymentStatus(authCookie)
      return resolve(event)
    } catch {
      delete event.locals.user
      delete event.locals.paymentStatus
    }
  }

  event.locals.isLoggedIn = false
  event.locals.settings = {
    darkMode: event.cookies.get('DarkMode') !== 'false'
  }

  return resolve(event)
}

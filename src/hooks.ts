import type { Handle, GetSession } from '@sveltejs/kit'
import type { Settings } from '$stores/settings'
import type { User } from '$stores/user'
import AccountTypes from '$lib/account-types'
import cookie from 'cookie'
import { HTTPerror, route } from '$lib'
import { dev } from '$app/env'

export type RenderSession = ({
  isLoggedIn: true
  user: User
} | {
  isLoggedIn: false
}) & {
  settings?: Settings
}

type AuthorizedResponse = {
  userID: string
  sessionID: string
  email: string
  verified: boolean
  accountType: AccountTypes
}

// Create a full URL for use in SSR requests
function serverRoute(path: string): string {
  return dev ? 'http://localhost:3000' + path : route(path)
}

// Get user appearance settings
async function getSettings(authCookie: string): Promise<Settings|undefined> {
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

// Get user and session info
async function getUser(authCookie: string): Promise<User> {
  const res = await fetch(serverRoute('/whoami'), {
    headers: {
      Cookie: `Authorization=${authCookie}`
    }
  })
  if (res.status !== 200) {
    throw new Error(await HTTPerror(res, 'Failed backend authentication.'))
  }

  const body: AuthorizedResponse = await res.json() // API responses have no 'isLoggedIn' property
  return {
    isLoggedIn: true,
    id: body.userID,
    email: body.email,
    verified: body.verified,
    accountType: body.accountType
  }
}

// Serverside request hook, used to fetch SSR data
export const handle: Handle = async ({ event, resolve }) => {
  const locals = event.locals as RenderSession

  // If an authorization cookie is present, assume the user is logged in
  const cookies = cookie.parse(
    event.request.headers.get('cookie') || '') as Record<string, string|undefined>
  const authCookie = cookies['Authorization']
  locals.isLoggedIn = authCookie !== undefined && authCookie.length > 0

  try {
    if (locals.isLoggedIn && authCookie != null) {
      locals.user = await getUser(authCookie)
      locals.settings = await getSettings(authCookie)
    }
  } catch {
    locals.isLoggedIn = false
    locals.settings = {
      darkMode: cookies['DarkMode'] !== 'false'
    }
  }

  return resolve(event)
}

// Return a session object based on SSR locals set from cookies
export const getSession: GetSession = (event) => {
  const locals = event.locals as RenderSession
  
  const session: RenderSession = locals.isLoggedIn ? {
    isLoggedIn: locals.isLoggedIn,
    settings: locals.settings,
    user: locals.user
  } : {
    isLoggedIn: locals.isLoggedIn,
    settings: locals.settings
  }
  
  return session
}
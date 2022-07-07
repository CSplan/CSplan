import type { Handle, GetSession } from '@sveltejs/kit'
import type { Settings } from '$stores/settings'
import type { User } from '$stores/user'
import cookie from 'cookie'
import { route } from '$lib'
import { dev } from '$app/env'

export type RenderSession = {
  isLoggedIn: true
  settings?: Settings
  user: User
} | {
  isLoggedIn: false
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
async function getUser(authCookie: string): Promise<User|null> {
  const res = await fetch(serverRoute('/whoami'), {
    headers: {
      Cookie: `Authorization=${authCookie}`
    }
  })
  if (res.status !== 200) {
    return null
  }

  const body: Omit<Assert<User, 'isLoggedIn'>, 'isLoggedIn'> = await res.json() // API responses have no 'isLoggedIn' property
  return {
    ...body,
    isLoggedIn: true
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

  if (locals.isLoggedIn) {
    const user = await getUser(authCookie!)
    if (user == null) {
      event.locals = { isLoggedIn: false }
      return resolve(event)
    }
    locals.user = user

    locals.settings = await getSettings(authCookie!)
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
    isLoggedIn: locals.isLoggedIn
  }

  return session
}
import type { Handle, GetSession } from '@sveltejs/kit'
import { Settings } from '$stores/settings'
import cookie from 'cookie'
import { HTTPerror, route } from '$lib'
import { dev } from '$app/env'

export type RenderSession = {
  isLoggedIn: true
  settings: Settings
} | {
  isLoggedIn: false
}

// Serverside request hook, used to parse session cookies for SSR
export const handle: Handle = async ({ event, resolve }) => {
  const locals = event.locals as RenderSession

  // If an authorization cookie is present, assume the user is logged in
  // TODO: validate logins serverside
  const cookies = cookie.parse(
    event.request.headers.get('cookie') || '') as Record<string, string|undefined>
  const authCookie = cookies['Authorization']
  locals.isLoggedIn = authCookie != null && authCookie.length > 0

  if (locals.isLoggedIn) {
    // Get user session info from API


    // Get settings from API
    const path = '/settings?filter=appearance'
    const url = dev ? `http://localhost:3000${path}` : route(path)
    const res = await fetch(url, {
      headers: {
        // Cookies have to manually be passed in serverside fetch requests
        Cookie: `Authorization=${authCookie}`
      }
    })
    if (res.status !== 200) {
      console.error(await HTTPerror(res, 'Failed to fetch settings'))
      return resolve(event)
    }

    const body: Settings = await res.json()

    locals.settings = {
      darkMode: body.darkMode
    }
  }

  return resolve(event)
}

// Return a session object based on SSR locals set from cookies
export const getSession: GetSession = (event) => {
  const locals = event.locals as RenderSession

  const session: RenderSession = locals.isLoggedIn ? {
    isLoggedIn: locals.isLoggedIn,
    settings: locals.settings
  } : {
    isLoggedIn: locals.isLoggedIn
  }

  return session
}
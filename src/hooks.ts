import type { Handle, GetSession } from '@sveltejs/kit'
import type { Settings } from '$stores/settings'
import { dev } from '$app/env'
import cookie from 'cookie'

export type RenderSession = {
  isLoggedIn: true
  settings: Settings
} | {
  isLoggedIn: false
}

// Serverside request hook, used to parse session cookies for SSR
export const handle: Handle = async ({ event, resolve }) => {
  const cookies = cookie.parse(
    event.request.headers.get('cookie') || '')

  const locals = event.locals as RenderSession

  const authCookie = cookies[`Authorization${dev ? '_DEV' : ''}`].split(':')
  if (authCookie.length > 0) {
    locals.isLoggedIn = true
  }

  if (locals.isLoggedIn) {
    locals.settings = {
      darkMode: cookies['DarkMode'] !== `${false}`
    }
  }

  const response = await resolve(event)
  return response
}

// Return a session object based on SSR locals set from cookies
export const getSession: GetSession = (event) => {
  const locals = event.locals as RenderSession

  const session: RenderSession = locals.isLoggedIn ? {
    isLoggedIn: locals.isLoggedIn,
    settings: {
      darkMode: locals.settings.darkMode
    }
  } : {
    isLoggedIn: locals.isLoggedIn
  }

  return session
}
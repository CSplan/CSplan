import { HTTPerror, route, csfetch } from '$lib'
import { derived, Readable, writable, get } from 'svelte/store'
import { aes, rsa } from 'cs-crypto'
import { mustGetByKey } from '$db'
import storage from '$db/storage'
import { AuthLevels } from '$lib/auth-levels'

type Store = {
  [id: string]: Session
}

function create(): Readable<Store> & SessionStore {
  const initialState: Store = {}
  const { subscribe, update } = writable(initialState)
  let initialized = false

  return {
    subscribe,
    async init(): Promise<void> {
      if (initialized) {
        return
      }
      // Fetch sessions from API
      const res = await csfetch(route('/sessions'))
      if (res.status !== 200) {
        throw new Error(await HTTPerror(res, 'Failed to csfetch sessions'))
      }
      const sessions: SessionDocument[] = await res.json()

      // Retrieve master cryptokey
      const user: UserStore['user'] = JSON.parse(localStorage.getItem('user')!)
      const { privateKey } = await mustGetByKey<MasterKeys>('keys', user.id)

      for (const session of sessions) {
      // Decrypt session metadata if present
        const meta = session.meta
        if (meta !== undefined) {
          const cryptoKey = await rsa.unwrapKey(meta.cryptoKey, privateKey)
          meta.browser = await aes.decrypt(meta.browser, cryptoKey)
          meta.ip = await aes.decrypt(meta.ip, cryptoKey)
          meta.os = await aes.decrypt(meta.os, cryptoKey)
        }

        // Add session to state
        // TODO: cache sessions (usable only if state of all sessions has not changed)
        const { id, authLevel, isCurrent } = session
        const created = new Date(session.created * 1000)
        const lastUsed = new Date(session.lastUsed * 1000)
        const final: Session = {
          id,
          created,
          lastUsed,
          authLevel,
          isCurrent
        }
        if (meta !== undefined) {
          final.ip = meta.ip
          final.os = meta.os
          final.browser = meta.browser
        }
        update((store) => {
          store[id] = final
          return store
        })
        initialized = true
      }
    },
    setAuthLevel(authLevel: AuthLevels): void {
      storage.setAuthLevel(authLevel)
      const session = get(currentSession)!
      update((store) => {
        store[session.id].authLevel = authLevel
        return store
      })
    },
    /**
     * Remotely logout of another active session
     * @authlevel 2
     */
    async logout(id: string): Promise<void> {
      const res = await csfetch(route(`/logout/${id}`), {
        method: 'POST',
        headers: {
          'CSRF-Token': storage.getCSRFtoken()
        }
      })
      if (res.status !== 204) {
        throw new Error(await HTTPerror(res, `Failed to log out of session ${id}`))
      }
      update((store) => {
        delete store[id]
        return store
      })
    }
  }
}

export const sessions = create()

function date2unix(d: Date): number {
  return Math.floor(d.getTime() / 1000)
}

export const ordered = derived(sessions, ($sessions) => {
  const now = Math.floor(Date.now() / 1000)
  return Object.values($sessions).sort((s1, s2) => (now - date2unix(s1.lastUsed)) - (now - date2unix(s2.lastUsed))) // Sort from shortest to longest time since last use
})

export const currentSession = derived(sessions, ($sessions) => {
  return Object.values($sessions).find(session => session.isCurrent)
})

export default sessions
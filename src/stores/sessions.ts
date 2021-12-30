import { HTTPerror, route } from '$lib'
import { derived, Readable, writable } from 'svelte/store'
import { aes, rsa } from 'cs-crypto'
import { mustGetByKey } from '$db'

type Store = {
  [id: string]: Session
}

function create(): Readable<Store> & SessionStore {
  const initialState: Store = {}
  const { subscribe, update } = writable(initialState)

  return {
    subscribe,
    async init(): Promise<void> {
      // Fetch sessions from API
      const res = await fetch(route('/sessions'))
      if (res.status !== 200) {
        throw new Error(await HTTPerror(res, 'Failed to fetch sessions'))
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
        const { id, created, lastUsed, authLevel, isCurrent } = session
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
      }
    }
  }
}

export const sessions = create()

export const ordered = derived(sessions, ($sessions) => {
  const now = Date.now()
  return Object.values($sessions).sort((s1, s2) => (now - s1.lastUsed) - (now - s2.lastUsed)) // Sort from shortest to longest time since last use
})

export default sessions
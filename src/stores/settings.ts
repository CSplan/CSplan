import { csfetch, route } from '$lib'
import { Store } from './store'

export type Settings = {
  darkMode: boolean
}

/** User settings (currently only used for appearance). */
class SettingsStore extends Store<Settings> {
  declare set: Store<Settings>['set']

  constructor() {
    super({
      darkMode: true
    })
    /* The root __layout populates this store from the user's SSR session information, 
    No initialization from cache is required, all values are set from cookies. */
  }

  /** Update the value of one or more settings and immediately save to API. */
  async saveAndCommit(this: SettingsStore, patch: Partial<Settings>): Promise<void> {
    // Update the memory store
    this.update((store) => {
      for (const key in patch) {
        const k = key as keyof Settings
        if (patch[k] == null) {
          continue
        }
        store[k] = patch[k]
      }
      return store
    })

    // Commit changes to API
    const res = await csfetch(route('/settings'), {
      method: 'PATCH',
      body: JSON.stringify(patch)
    })
    if (res.status !== 200) {
      const error: ErrorResponse = await res.json()
      throw new Error(error.message)
    }
  }
}


export default new SettingsStore()
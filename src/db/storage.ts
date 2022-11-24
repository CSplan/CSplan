import type { AuthLevels } from '$lib/auth-levels'

/** localStorage keys */
export const enum Keys {
  CSRF = 'CSRF-Token',
  AuthLevel = 'authlevel',
  ShowArchivedLists = 'show-archived-lists'
}

/** Static getters and setters for localStorage */
export const storage = {
  getCSRFtoken(): string {
    return localStorage.getItem(Keys.CSRF)!
  },
  setCSRFtoken(token: string): void {
    localStorage.setItem(Keys.CSRF, token)
  },

  getAuthLevel(): AuthLevels {
    return parseInt(localStorage.getItem(Keys.AuthLevel)!)
  },
  setAuthLevel(authLevel: AuthLevels): void {
    localStorage.setItem(Keys.AuthLevel, authLevel.toString())
  }
}

export default storage
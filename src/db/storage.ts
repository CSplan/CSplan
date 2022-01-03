/** localStorage keys */
export const enum Keys {
  CSRF = 'CSRF-Token',
  User = 'user'
}

/** Static getters and setters for localStorage */
export const storage = {
  getCSRFtoken(): string {
    return localStorage.getItem(Keys.CSRF)!
  },
  setCSRFtoken(token: string): void {
    localStorage.setItem(Keys.CSRF, token)
  },

  getUser(): UserStore['user'] {
    return JSON.parse(localStorage.getItem(Keys.User)!)
  },
  setUser(user: UserStore['user']): void {
    localStorage.setItem(Keys.User, JSON.stringify(user))
  }
}

export default storage
// LocalStorage wrapper functions
export const pageStorage = {
  /** Set an item in storage. */
  setItem(key: keyof App.Locals, value: string): void {
    localStorage.setItem(key, value)
  },
  /** Get an item from storage. */
  getItem(key: keyof App.Locals): string|null {
    return localStorage.getItem(key)
  },
  /** Remove an item from storage. */
  removeItem(key: keyof App.Locals): void {
    localStorage.removeItem(key)
  },

  /** Store an item using JSON, remove the item from storage if it's null. */
  setJSON(key: keyof App.Locals, value: Record<string, unknown>|undefined): void {
    if (value != null) {
      this.setItem(key, JSON.stringify(value))
    } else {
      this.removeItem(key)
    }
  },
  /** Get an item, and parse it as JSON if it isn't null. */
  getJSON<K extends keyof App.Locals>(key: K): App.Locals[K]|null {
    const encoded = this.getItem(key)
    if (encoded === null) {
      return null
    }
    return JSON.parse(encoded)
  },

  /** Store all page data values. */
  setAll(data: App.Locals): void {
    this.setItem('isLoggedIn', data.isLoggedIn.toString())
    this.setJSON('user', data.user)
    this.setJSON('paymentStatus', data.paymentStatus)
    this.setJSON('settings', data.settings)
  }
}

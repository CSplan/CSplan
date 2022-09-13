// LocalStorage wrapper functions
export const pageStorage = {
  /** Set an item in storage. */
  setItem(key: keyof App.Locals, value: string): void {
    localStorage.setItem(key, value)
  },
  /** Get an item from storage. */
  getItem(key: keyof App.Locals): string|unknown {
    return localStorage.getItem(key)
  },
  /** Remove an item from storage. */
  removeItem(key: keyof App.Locals): void {
    localStorage.removeItem(key)
  },

  /** Storage an item using JSON, remove the item from storage if it's undefined. */
  setJSON(key: keyof App.Locals, value: Record<string, unknown>|undefined): void {
    if (value != null) {
      this.setItem(key, JSON.stringify(value))
    } else {
      this.removeItem(key)
    }
  }
}

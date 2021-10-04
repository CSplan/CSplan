import { writable, Writable } from 'svelte/store'

export class BaseStore<T extends Record<string, unknown>> {
  public subscribe: Writable<T>['subscribe']
  protected update: Writable<T>['update']
  protected state: T

  constructor(initialState: T) {
    // Create internal store
    const { subscribe, update }= writable(initialState)
    this.subscribe = subscribe
    this.update = update
    // Subscribe to state changes
    this.state = initialState
    this.subscribe((state) => {
      this.state = state
    }) 
  }
}
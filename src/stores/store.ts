import type { Readable, Writable } from 'svelte/store'
import { writable, get } from 'svelte/store'

/** A store instance with protected update and set methods. */
export class Store<T> implements Readable<T> {
  readonly initialValue: T

  readonly subscribe: Readable<T>['subscribe']
  protected readonly update: Writable<T>['update']
  protected readonly set: Writable<T>['set']

  // Get the value of a store outside of a Svelte component
  protected static readonly get = get

  constructor(initialValue: T) {
    this.initialValue = initialValue
    const store = writable(this.initialValue)
    this.subscribe = store.subscribe
    this.update = store.update
    this.set = store.set
  }
}

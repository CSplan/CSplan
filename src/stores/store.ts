import type { Readable, Writable } from 'svelte/store'
import { writable } from 'svelte/store'

/** A store instance with protected update and set methods. */
export class Store<T> implements Readable<T> {
  protected readonly initialValue: T

  readonly subscribe: Readable<T>['subscribe']
  protected readonly update: Writable<T>['update']
  protected readonly set: Writable<T>['set']

  constructor(initialValue: T) {
    this.initialValue = initialValue
    const store = writable(this.initialValue)
    this.subscribe = store.subscribe
    this.update = store.update
    this.set = store.set
  }
}

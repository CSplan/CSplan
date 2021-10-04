declare type Flags = {
  flags?: {
    uncommitted?: boolean
  }
}

// Events that have currentTarget guaranteed as elements - for use in evt handlers
declare type SafeEvent = Event & { currentTarget: EventTarget & HTMLElement }

declare type ErrorResponse = {
  title: string
  message: string
  status: number
}

declare type MasterKeys = {
  publicKey: CryptoKey
  privateKey: CryptoKey
}

declare type KeyedObject = {
  id: string
  [index: string]: unknown
}

declare type SMSXStore<R extends KeyedObject, D extends unknown> = {
  async init(): Promise<void>
  async create(data: D): Promise<{
    id: string
  }>
  update(id: string, data: Partial<R>): void
  async commit(id: string): Promise<R>|Promise<void>
  async delete(id: string): Promise<void>
}

declare type BasicStore<D extends unknown> = {
  async init(): Promise<void>
  async create(data: D): Promise<void>
}
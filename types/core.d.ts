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
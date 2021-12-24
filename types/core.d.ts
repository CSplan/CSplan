declare type Flags = {
  flags?: {
    uncommitted?: boolean
  }
}

declare type SafeEvent<T = HTMLElement> = Event & { currentTarget: EventTarget & T }

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
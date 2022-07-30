declare type Flags = Partial<{
  flags: Partial<{ // TODO: flags object itself should not be optional
    uncommitted: boolean
    saveState: import('$lib/form-states').FormStates
  }>
}>

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

declare type KeyedObject<K extends string> = {
  [keyPath in K]: string
} & Record<string, unknown>
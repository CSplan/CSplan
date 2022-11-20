// State describes the 'meta' property of API responses to POST/PUT/PATCH requests
declare type State = {
  checksum: string
}
declare type OrderedState = State & {
  index: number
}

// Minimal API responses to POST/PUT/PATCH requests
declare type StateResponse = {
  id: string
  meta: State
}
declare type OrderedStateResponse = {
  id: string
  meta: OrderedState
}

// Meta describes the 'meta' property of API responses to GET requests
declare type Meta<E extends boolean = false> = {
  cryptoKey: E extends true ? string : CryptoKey
  checksum: string
}
declare type OrderedMeta<E extends boolean = false> = Meta<E> & {
  index: number
}

// MetaPatch describes the 'meta' property of API patch requests
declare type MetaPatch = Partial<Omit<Meta<true>, 'checksum'>>
declare type OrderedMetaPatch = Partial<Omit<OrderedMeta<true>, 'checksum'>>

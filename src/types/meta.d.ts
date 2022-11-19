// #region Legacy
declare type Legacy_Meta = {
  id: string
  meta: {
    cryptoKey: string
    checksum: string
  }
}
declare type Legacy_IndexedMetaResponse = Legacy_Meta & {
  meta: Legacy_Meta['meta'] & {
    index: number
  }
}

declare type Legacy_MetaRequest = {
  meta: {
    cryptoKey: string
  }
}
declare type Legacy_IndexedMetaUpdate = {
  meta?: {
    index?: number
  }
}

declare type Legacy_MetaState = {
  id: string
  cryptoKey: CryptoKey
  checksum: string
}
declare type Legacy_IndexedMetaState = MetaState & {
  index: number
}

// MetaState with cryptoKey made optional
declare type HybridMetaState = Omit<MetaState, 'cryptoKey'> & {
  cryptoKey?: CryptoKey
}
// #endregion

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

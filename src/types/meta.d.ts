declare type Meta = {
  id: string
  meta: {
    cryptoKey: string
    checksum: string
  }
}
declare type IndexedMetaResponse = Meta & {
  meta: Meta['meta'] & {
    index: number
  }
}

declare type MetaRequest = {
  meta: {
    cryptoKey: string
  }
}
declare type IndexedMetaUpdate = {
  meta?: {
    index?: number
  }
}

declare type MetaState = {
  id: string
  cryptoKey: CryptoKey
  checksum: string
}
declare type IndexedMetaState = MetaState & {
  index: number
}

// MetaState with cryptoKey made optional
declare type HybridMetaState = Omit<MetaState, 'cryptoKey'> & {
  cryptoKey?: CryptoKey
}
declare type MetaResponse = {
  id: string
  meta: {
    cryptoKey: string
    checksum: string
  }
}
declare type IndexedMetaResponse = MetaResponse & {
  meta: MetaResponse['meta'] & {
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
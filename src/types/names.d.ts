declare type NameDocument<M = NameMetaResponse> = M & NameData<true>

declare type NameMetaRequest = {
  meta: {
    cryptoKey?: string
  }
}

declare type NameMetaResponse = {
  meta: {
    cryptoKey?: string
    checksum: string
  }
}

declare type NameData<E extends boolean = false> = {
  firstName: string
  lastName: string
  username?: string

  visibility: NameVisibility

  displayName: import('$lib').DisplayNames
  privateDisplayName?: E extends true ? string : import('$lib').DisplayNames
}

declare type NameVisibility = {
  firstName: import('$lib').Visibilities
  lastName: import('$lib').Visibilities
}

declare type Name = Omit<MetaState, 'cryptoKey'> & {
  cryptoKey?: CryptoKey
} & NameData

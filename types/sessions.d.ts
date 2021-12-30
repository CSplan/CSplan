declare type SessionDocument = Session & SessionMeta & SessionMetaResponse

declare type SessionMetaResponse = {
  meta?: {
    cryptoKey: string
  }
}

declare type SessionData = {
  id: string
  created: number
  lastUsed: number
  authLevel: number
  isCurrent: boolean
}

declare type SessionMeta = {
  meta?: {
    ip: string
    os: string
    browser: string
  }
}

declare type Session = Omit<MetaState, 'cryptoKey'> & {
  cryptoKey?: CryptoKey
} & SessionData & SessionMeta['meta']

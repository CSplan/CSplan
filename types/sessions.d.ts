declare type SessionDocument = SessionData & SessionMeta & SessionMetaResponse

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

declare type ParsedSessionData = {
  id: string
  created: Date
  lastUsed: Date
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

declare type Session = ParsedSessionData & Partial<SessionMeta['meta']>

declare type SessionStore = {
  async init(): Promise<void>
}
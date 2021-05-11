type ErrorResponse = {
  title: string
  message: string
  status: number
}
type Encrypted = string

type MasterKeys = {
  publicKey: CryptoKey
  privateKey: CryptoKey
}

type KeyedObject = {
  id: string
  [index: string]: unknown
}

type SMSXStore = {
  async init(): Promise<void>
  async create(data: unknown): Promise<KeyedObject>
  update(id: string, data: unknown): void
  async commit(id: string): Promise<KeyedObject>|Promise<void>
  async delete(id: string): Promise<void>

  // BEGIN NON-SMSX REQUIRED METHODS

  // Commit all instances of a resource that have flagged updates
  async commitUnsaved?(): Promise<void>
  // Move a resource by modifying the necessary indexes
  async move?(id: string, index: number): Promise<void>
}

// Events that have currentTarget guaranteed as elements - for use in evt handlers
type SafeEvent = Event & { currentTarget: EventTarget & HTMLElement }
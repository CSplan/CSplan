type ErrorResponse = {
  title: string,
  message: string,
  status: number
}
type Encrypted = string

type MasterKeys = {
  publicKey: CryptoKey,
  privateKey: CryptoKey
}

interface KeyedObject {
  id: string,
  [index: unknown]: unknown
}

interface SMSXStore {
  async init(): Promise<void>
  async create(data: unknown): Promise<KeyedObject>
  async update(id: string, data: unknown): Promise<void>
  async commit(id: string): Promise<KeyedObject>
  async delete(id: string): Promise<void>
}

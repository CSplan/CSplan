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
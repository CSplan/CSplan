import type { Argon2HashParams } from './argon2'

export type MasterKeys = {
  publicKey: string
  privateKey: string
  hashParams: Argon2HashParams
}

export type Argon2HashParams = {
  type: 'argon2i',
  timeCost: number
  memoryCost: number
  threads: number
  salt: string
}

export function importKeyMaterial(keyMaterial: Uint8Array): PromiseLike<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    keyMaterial,
    'AES-GCM',
    false,
    ['wrapKey', 'unwrapKey', 'encrypt', 'decrypt']
  )
}

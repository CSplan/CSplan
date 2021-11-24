export function importKeyMaterial(keyMaterial: Uint8Array): PromiseLike<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    keyMaterial,
    'AES-GCM',
    false,
    ['wrapKey', 'unwrapKey', 'encrypt', 'decrypt']
  )
}

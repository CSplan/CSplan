declare type Argon2HashParams = {
  type: 'argon2i'
  timeCost: number
  memoryCost: number
  threads: number
  salt: string
}

declare type PasswordChange = {
  authKey: Uint8Array
  privateKey: Uint8Array
  hashParams: Argon2HashParams
}
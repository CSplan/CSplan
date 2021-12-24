declare type TOTPStatus = {
  enabled: boolean
}

declare type TOTPinfo = {
  secret: string
  backupCodes: number[]
}

declare type TOTPRequest = {
  TOTP_Code: number
}
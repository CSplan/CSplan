declare type UserPFP = {
  exists: boolean
  image?: Blob
  checksum?: string
}

declare type UserPFPMeta = {
  cryptoKey?: string
  visibility: Visibilities
  encoding: string
}

declare type UserPFPMetaResponse = UserPFPMeta & {
  checksum: string
}

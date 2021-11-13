declare type UserPFP = {
  image?: Blob
  checksum?: string
}

declare type UserPFPMeta = {
  cryptoKey?: string
  visibility: import('$lib').Visibilities
  encoding: string
}

declare type UserPFPMetaResponse = UserPFPMeta & {
  checksum: string
}

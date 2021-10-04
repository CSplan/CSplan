declare type UserPFP = {
  exists: boolean
  image?: Blob
  checksum?: string
}

declare type UserPFPMeta = MetaRequest['meta'] & {
  encoding: string
}

declare type UserPFPMetaResponse = UserPFPMeta & {
  checksum: string
}

// TODO: prepare renders to be directly attached to html
declare type UserPFPData = {
  image?: Blob
}

declare type UserPFPMeta = {
  checksum?: string
  cryptoKey?: string
  visibility?: import('$lib').Visibilities
  encoding?: string
}

declare type UserPFP = UserPFPData & UserPFPMeta

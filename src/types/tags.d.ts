/**
 * @encrypted
 */
declare type TagDocument<M = Legacy_Meta> = M & TagData

declare type TagData = {
  name: string
  color: string
  textColor: string
}

declare type Tag = Flags & Legacy_MetaState & TagData

declare type TagStore = SMSXStore<Tag, TagData>
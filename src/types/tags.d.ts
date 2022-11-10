/**
 * @encrypted
 */
declare type TagDocument<M = Meta> = M & TagData

declare type TagData = {
  name: string
  color: string
  textColor: string
}

declare type Tag = Flags & MetaState & TagData

declare type TagStore = SMSXStore<Tag, TagData>
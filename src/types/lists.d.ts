/**
 * A list document received from the API
 * @encrypted
 * @param M Meta type used
 */
declare type ListDocument<M = Legacy_IndexedMetaResponse> = M & EncryptedListData

declare type ListItem<E extends boolean = false> = {
  title: string
  description: string
  done: E extends true ? string : boolean
  tags: string[]
}

declare type List<E extends boolean = false> = {
  id: string
  title: string
  items: ListItem<E>[]
}

declare type ListData<E extends boolean = false> = {
  title: string
  items: ListItem<E>[]
}

declare type ListStore = SMSXStore<List, ListData> & {
  // Commit all instances of a resource that have flagged updates
  async commitUnsaved(): Promise<void>
  // Move a resource by modifying the necessary indexes
  async move(id: string, index: number): Promise<void>
}
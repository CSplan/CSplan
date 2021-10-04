import { aes } from 'cs-crypto'

export async function encryptList(list: ListData, key: CryptoKey): Promise<EncryptedListData> {
  return {
    title: await aes.encrypt(list.title, key),
    items: await Promise.all(list.items.map( // obnoxious javascript-y way of expressing an async for loop declaratively
      async (item: ListItem<false>) => {
        return {
          title: await aes.encrypt(item.title, key),
          description: await aes.encrypt(item.description, key),
          done: await aes.encrypt(item.done.toString(), key), // convert done to the string 'true' or 'false' before encrypting
          tags: item.tags // tag -> item relations aren't encrypted, this is needed for backend functions such as the deletion of all relationships pertaining to a tag when the tag itself is deleted
        } 
      }))
  }
}

export async function decryptList(encrypted: EncryptedListData, key: CryptoKey): Promise<ListData> {
  return {
    title: await aes.decrypt(encrypted.title, key),
    items: await Promise.all(encrypted.items.map(
      async (item: ListItem<true>) => {
        return {
          title: await aes.decrypt(item.title, key),
          description: await aes.decrypt(item.description, key),
          done: await aes.decrypt(item.done, key) === 'true',
          tags: item.tags
        }
      }
    ))
  }
}
import { aes } from 'cs-crypto'
import type { ListData } from '../lists'

/** Encrypt a todo list */
export async function encryptList(list: ListData, key: CryptoKey): Promise<ListData<true>> {
  return {
    title: await aes.encrypt(list.title, key),
    items: await Promise.all(list.items.map( // obnoxious javascript-y way of expressing an async for loop declaratively
      async (item) => {
        return {
          title: await aes.encrypt(item.title, key),
          description: await aes.encrypt(item.description, key),
          done: await aes.encrypt(item.done.toString(), key), // convert done to the string 'true' or 'false' before encrypting
          tags: item.tags // tag -> item relations aren't encrypted, this is needed for backend functions such as the deletion of all relationships pertaining to a tag when the tag itself is deleted
        } 
      }))
  }
}

/** Decrypt a todo list */
export async function decryptList(encrypted: ListData<true>, key: CryptoKey): Promise<ListData> {
  return {
    title: await aes.decrypt(encrypted.title, key),
    items: await Promise.all(encrypted.items.map(
      async (item) => {
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

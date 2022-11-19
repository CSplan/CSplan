import { derived } from 'svelte/store'
import { rsa, aes } from 'cs-crypto'
import { deleteFromStore, getByKey, mustGetByKey, addToStore } from '../db'
import { pageStorage } from '$lib/page'
import { HTTPerror, csfetch, route } from '$lib'
import storage from '$db/storage'
import { Store } from './store'

export type TagData = {
  name: string
  color: string
  textColor: string
}

export type Tag<E extends boolean = false> = TagData & {
  id: string
  meta: Meta<E>
}

class TagStore extends Store<Record<string, Tag>> {
  initialized = false
  declare update: Store<Record<string, Tag>>['update']

  constructor() {
    super({})
  }


  async init(this: TagStore): Promise<void> {
    if (this.initialized) {
      return
    }
    // Fetch tags from API
    const res = await csfetch(route('/tags'))
    if (res.status !== 200) {
      throw await HTTPerror(res, 'Failed to fetch tags')
    }
    const tags: Tag<true>[] = await res.json()

    // Decrypt each tag not matching a cached checksum
    const user = pageStorage.getJSON('user')!
    const { privateKey } = await mustGetByKey<MasterKeys>('keys', user.id) // Decrypt the user's master private key
    for (const tag of tags) {
      const cached = await getByKey<Tag>('tags', tag.id)
      if (cached != null && cached.meta.checksum === tag.meta.checksum) {
        this.update((store) => {
          store[tag.id] = cached
          return store
        })
        continue
      }

      // Decrypt the AES key
      const cryptoKey = await rsa.unwrapKey(tag.meta.cryptoKey, privateKey)

      // Decrypt the tag
      const final: Tag = {
        id: tag.id,
        ...await aes.deepDecrypt({
          name: tag.name,
          color: tag.color,
          textColor: tag.textColor
        }, cryptoKey),
        meta: {
          cryptoKey,
          checksum: tag.meta.checksum
        }
      }

      await addToStore('tags', final)
      this.update((store) => {
        store[tag.id] = final
        return store
      })
    }
    this.initialized = true
  }


  async create(this: TagStore, tag: TagData): Promise<string> {
    if (typeof tag !== 'object') {
      throw new Error(`Expected type object, received type ${typeof tag}.`)
    }

    // Retrieve master public key for encryption
    const cryptoKey = await aes.generateKey('AES-GCM')
    const user = pageStorage.getJSON('user')!
    const { publicKey } = await mustGetByKey<MasterKeys>('keys', user.id)

    // Encrypt and store with API
    const body: TagData & { meta: Required<MetaPatch> } = {
      ...await aes.deepEncrypt(tag, cryptoKey),
      meta: {
        cryptoKey: await rsa.wrapKey(cryptoKey, publicKey)
      }
    }
    
    const res = await csfetch(route('/tags'), {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'CSRF-Token': storage.getCSRFtoken(),
        'Content-Type': 'application/json'
      }
    })
    if (res.status !== 201) {
      throw await HTTPerror(res, 'Failed to create tag')
    }
    const { id, meta }: StateResponse = await res.json()

    // Update the tag with values from API
    const final: Tag = {
      ...tag,
      id,
      meta: {
        cryptoKey,
        checksum: meta.checksum
      }
    }

    // Add to IDB and then store
    await addToStore('tags', final)
    this.update((store) => {
      store[final.id] = final
      return store
    })

    return final.id
  }

  async commit(this: TagStore, id: string): Promise<void> {
    const tag = Store.get(this)[id]
    if (tag == null) {
      throw new ReferenceError('Invalid ID passed, tag does not exist')
    }

    // Encrypt and commit to API
    const encrypted = await aes.deepEncrypt<TagData>({
      name: tag.name,
      color: tag.color, 
      textColor: tag.textColor
    }, tag.meta.cryptoKey)
    const res = await csfetch(route(`/tags/${id}`), {
      method: 'PATCH',
      headers: {
        'CSRF-Token': storage.getCSRFtoken(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(encrypted)
    })
    if (res.status !== 200) {
      throw await HTTPerror(res, 'Failed to update tag with server')
    }
    const { meta }: StateResponse = await res.json()
    tag.meta.checksum = meta.checksum

    // Commit to IDB
    await addToStore('tags', tag)
    // Commit to local state
    this.update((store) => {
      store[id] = tag
      return store
    })
  }

  async delete(this: TagStore, id: string): Promise<void> {
    const tag = Store.get(this)[id]
    if (tag == null) {
      return
    }

    // Delete from API
    const res = await csfetch(route(`/tags/${id}`), {
      method: 'DELETE',
      headers: {
        'CSRF-Token': storage.getCSRFtoken()
      }
    })
    if (res.status !== 204) {
      throw await HTTPerror(res, 'Failed to delete tag from server')
    }

    // Delete from IDB
    await deleteFromStore('tags', id)
    // Delete from memory
    this.update((store) => {
      delete store[id]
      return store
    })
  }
}

export const tags = new TagStore()

// TODO: implement tag ordering
export const ordered = derived(tags, ($tags) => {
  return Object.values($tags)
})

export default tags

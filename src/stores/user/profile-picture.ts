import { aes, rsa } from 'cs-crypto'
import * as db from '$db'
import { Visibilities, route, csfetch, HTTPerror } from '$lib'
import { pageStorage } from '$lib/page'
import { Store } from '../store'

export type UserPFP<E extends boolean = false> = PFPData & {
  exists: true
  id: string
  meta: UserPFPMeta<E>
} | {
  exists: false
}

export type UserPFPMeta<E extends boolean = false> = Omit<Meta<E>, 'cryptoKey'> & {
  cryptoKey?: Meta<E>['cryptoKey']
  visibility: import('$lib').Visibilities
  encoding: string
}

export type PFPData = {
  image: Blob
}

class UserPFPStore extends Store<UserPFP> {
  private initialized = false

  constructor() {
    super({
      exists: false
    })
  }

  async init(this: UserPFPStore): Promise<void> {
    if (this.initialized) {
      return
    }

    const res = await csfetch(route('/profile-picture'))
    // If no PFP has been set for the user, nothing needs to be changed from initial state
    if (res.status === 204) {
      this.initialized = true
      return
    } else if (res.status !== 200) {
      throw await HTTPerror(res, 'Failed to initialize user PFP')
    }

    const meta: UserPFPMeta<true> = JSON.parse(res.headers.get('X-Image-Meta')!)
    // Use cache if checksums match
    const user = pageStorage.getJSON('user')!
    const cached = await db.getByKey<UserPFP>('user/profile-picture', user.id)
    if (cached != null && cached.exists && cached.meta.checksum === meta.checksum) {
      this.set(cached)
      this.initialized = true
      return
    }

    let image: Blob, encoding: string, cryptoKey: CryptoKey|undefined
    if (meta.visibility === Visibilities.Encrypted) {
      // Decrypt metadata
      const { privateKey } = await db.mustGetByKey<MasterKeys>('keys', user.id)
      cryptoKey = await rsa.unwrapKey(meta.cryptoKey!, privateKey, 'AES-GCM')
      encoding = await aes.decrypt(meta.encoding, cryptoKey)

      // Decrypt and decode the image itself
      const encrypted = new Uint8Array(await res.arrayBuffer())
      image = await aes.blobDecrypt(encrypted, cryptoKey, meta.encoding)
    } else {
      encoding = meta.encoding
      image = new Blob([new Uint8Array(await res.arrayBuffer())], {
        type: encoding
      })
    }

    // Update local state and cache
    const final: UserPFP = {
      exists: true,
      id: user.id,
      image,
      meta: {
        cryptoKey,
        checksum: meta.checksum,
        visibility: meta.visibility,
        encoding
      }
    }
    this.set(final)

    await db.addToStore('user/profile-picture', final)
    this.initialized = true
  }

  async create(this: UserPFPStore, image: Blob, visibility: Visibilities): Promise<void> {
    const encoding = image.type

    let rawImage: Uint8Array
    let meta: Omit<UserPFPMeta<true>, 'checksum'>
    const user = pageStorage.getJSON('user')!

    // Encrypt/encode the image depending on visibility
    let cryptoKey: CryptoKey|undefined
    if (visibility === Visibilities.Encrypted) {
      // Encrypt the image
      cryptoKey = await aes.generateKey('AES-GCM')
      rawImage = await aes.binaryEncrypt(new Uint8Array(await image.arrayBuffer()), cryptoKey)

      // Wrap the cryptokey and encrypt image encoding info
      const { publicKey } = await db.mustGetByKey<MasterKeys>('keys', user.id)
      meta = {
        visibility,
        cryptoKey: await rsa.wrapKey(cryptoKey, publicKey),
        encoding: await aes.encrypt(encoding, cryptoKey)
      }
    } else {
      rawImage = new Uint8Array(await image.arrayBuffer())
      meta = {
        visibility,
        encoding
      }
    }

    // Store the encrypted data with the backend
    const contentType = visibility === Visibilities.Encrypted ? 'application/octet-stream' : encoding
    const res = await csfetch(route('/profile-picture'), {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
        'X-Image-Meta': JSON.stringify(meta)
      },
      body: rawImage.buffer
    })
    if (res.status !== 200) {
      if (res.status === 409) {
        throw new Error('A user profile picture has already been created')
      }
      throw await HTTPerror(res, 'Failed to create user PFP')
    }
    const body: Omit<StateResponse, 'id'> = await res.json()

    // Update state
    const final: UserPFP = {
      exists: true,
      id: user.id,
      image,
      meta: {
        cryptoKey,
        visibility: meta.visibility,
        encoding,
        checksum: body.meta.checksum
      }
    }
    this.set(final)
  
    // Update IDB
    await db.addToStore('user/profile-picture', final)
  }

  async delete(this: UserPFPStore): Promise<void> {
    const res = await csfetch(route('/profile-picture'), {
      method: 'DELETE'
    })
    if (res.status !== 204) {
      throw await HTTPerror(res, 'Failed to delete user PFP')
    }
    this.reset()
    await db.clearStore('user/profile-picture')
  }
}

export const userPFP = new UserPFPStore()

export default userPFP
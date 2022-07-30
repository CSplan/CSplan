import { mustGetByKey, addToStore, getByKey } from '$db'
import { csfetch, HTTPerror, route } from '$lib'
import userStore, { User } from '$stores/user'
import { Store } from '../store'
import { aes, rsa } from 'cs-crypto'

export type StripeCustomerID<E extends boolean = false> = (E extends true ? Meta : MetaState) & {
  exists: true
  address: StripeAddress
} | {
  exists: false
}

export type StripeAddress = {
  country: 'US' | 'CA'
  postalCode: string
} | {
  country: string
  postalCode?: string
}

class StripeCustomerIDStore extends Store<StripeCustomerID> {
  initialized = false

  constructor() {
    super({
      exists: false
    })
  }

  async init(): Promise<void> {
    if (this.initialized) {
      return
    }

    const res = await csfetch(route('/stripe/customer-id'))
    if (res.status === 404) {
      this.initialized = true
      return
    } else if (res.status !== 200) {
      throw new Error(await HTTPerror(res, 'Failed to retrieve Stripe customer ID.'))
    }

    const body: Assert<StripeCustomerID<true>, 'exists'> & Meta = await res.json()
    // Decrypt the customer ID information
    const user = Store.get(userStore) as Assert<User, 'isLoggedIn'>
    const cached = await getByKey<StripeCustomerID & MetaState>('stripe/customer-id', user.id)
    if (cached != null && cached.exists && cached.checksum === body.meta.checksum) {
      this.set(cached)
      return
    }

    // Decrypt the response body
    const { privateKey } = await mustGetByKey<MasterKeys>('keys', user.id)
    const cryptoKey = await rsa.unwrapKey(body.meta.cryptoKey, privateKey, 'AES-GCM')
    const final: StripeCustomerID & MetaState & KeyedObject<'userID'> = {
      exists: true,
      id: await aes.decrypt(body.id, cryptoKey),
      address: await aes.deepDecrypt(body.address, cryptoKey),
      cryptoKey,
      checksum: body.meta.checksum,
      userID: user.id
    }
    // Add to memory state
    this.set(final)
    // Add to IDB
    await addToStore<'userID'>('stripe/customer-id', final)

    this.initialized = true
  }

  async create(address: StripeAddress): Promise<string> {
    // Create customer ID with Stripe via API
    const res = await csfetch(route('/stripe/customer-id'), {
      method: 'POST',
      body: JSON.stringify(address)
    })
    if (res.status !== 201) {
      throw new Error(await HTTPerror(res, 'Failed to create customer ID with Stripe'))
    }

    // Decode the response body
    const body: Assert<StripeCustomerID<true>, 'exists'> & Meta = await res.json()

    // Decrypt the response body
    const user = Store.get(userStore) as Assert<User, 'isLoggedIn'>
    const { privateKey } = await mustGetByKey<MasterKeys>('keys', user.id)
    const cryptoKey = await rsa.unwrapKey(body.meta.cryptoKey, privateKey, 'AES-GCM')
    const final: StripeCustomerID & MetaState & KeyedObject<'userID'> = {
      exists: true,
      id: await aes.decrypt(body.id, cryptoKey),
      address: await aes.deepDecrypt(body.address, cryptoKey),
      cryptoKey,
      checksum: body.meta.checksum,
      userID: user.id
    }
    // Add to memory state
    this.set(final)
    // Add to IDB
    await addToStore<'userID'>('stripe/customer-id', final)

    return final.id
  }
}

export const stripe = new StripeCustomerIDStore()

export default stripe
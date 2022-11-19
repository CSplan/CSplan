import { mustGetByKey, addToStore, getByKey } from '$db'
import { csfetch, HTTPerror, route } from '$lib'
import { Store } from '../store'
import { aes, rsa } from 'cs-crypto'
import { pageStorage } from '$lib/page'

export type StripeCustomerID<E extends boolean = false> = {
  exists: true
  id: string
  userID: E extends false ? string : never
  address: StripeAddress
  meta: Meta<E>
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

  async init(this: StripeCustomerIDStore): Promise<void> {
    if (this.initialized) {
      return
    }

    const res = await csfetch(route('/stripe/customer-id'))
    if (res.status === 404) {
      this.initialized = true
      return
    } else if (res.status !== 200) {
      throw await HTTPerror(res, 'Failed to retrieve Stripe customer ID.')
    }

    const body: Assert<StripeCustomerID<true>, 'exists'> = await res.json()
    // Decrypt the customer ID information
    const user = pageStorage.getJSON('user')!
    const cached = await getByKey<StripeCustomerID>('stripe/customer-id', user.id)
    if (cached != null && cached.exists && cached.meta.checksum === body.meta.checksum) {
      this.set(cached)
      return
    }

    // Decrypt the response body
    const { privateKey } = await mustGetByKey<MasterKeys>('keys', user.id)
    const cryptoKey = await rsa.unwrapKey(body.meta.cryptoKey, privateKey, 'AES-GCM')
    const stripeCID: StripeCustomerID = { 
      exists: true,
      id: await aes.decrypt(body.id, cryptoKey),
      address: await aes.deepDecrypt(body.address, cryptoKey),
      userID: user.id,
      meta: {
        cryptoKey,
        checksum: body.meta.checksum
      }
    }
    // Add to memory state
    this.set(stripeCID)
    // Add to IDB
    await addToStore<'userID'>('stripe/customer-id', stripeCID)

    this.initialized = true
  }

  async create(this: StripeCustomerIDStore, address: StripeAddress): Promise<string> {
    // Create customer ID with Stripe via API
    const res = await csfetch(route('/stripe/customer-id'), {
      method: 'POST',
      body: JSON.stringify(address)
    })
    if (res.status !== 201) {
      throw await HTTPerror(res, 'Failed to create customer ID with Stripe')
    }

    // Decode the response body
    const body: Assert<StripeCustomerID<true>, 'exists'>  = await res.json()

    // Decrypt the response body
    const user = pageStorage.getJSON('user')!
    const { privateKey } = await mustGetByKey<MasterKeys>('keys', user.id)
    const cryptoKey = await rsa.unwrapKey(body.meta.cryptoKey, privateKey, 'AES-GCM')
    const final: StripeCustomerID = { 
      exists: true,
      id: await aes.decrypt(body.id, cryptoKey), // Stripe CID
      address, 
      userID: user.id,
      meta: {
        cryptoKey,
        checksum: body.meta.checksum
      }
    }
    // Add to memory state
    this.set(final)
    // Add to IDB
    await addToStore<'userID'>('stripe/customer-id', final)

    return final.id
  }

  // Update Stripe customer address
  async updateAddress(this: StripeCustomerIDStore, address: StripeAddress): Promise<void> {
    // Get and encode stripe crypto key (needed for server to decrypt stripe CID)
    const store = Store.get(this)
    if (!store.exists) {
      throw new Error('Customer address update requested when customer doesn\'t exist')
    }
    const res = await csfetch(route('/stripe/customer-id'), {
      method: 'PATCH',
      body: JSON.stringify(address),
      headers: {
        'X-Stripe-CryptoKey': await aes.exportKey(store.meta.cryptoKey)
      }
    })
    if (res.status !== 200) {
      throw await HTTPerror(res, 'Failed to update customer address with Stripe')
    }

    // Decode response body
    const body: { meta: State } = await res.json()
    const user = pageStorage.getJSON('user')!
    const final: Assert<StripeCustomerID, 'exists'> = {
      ...await mustGetByKey('stripe/customer-id', user.id),
      address
    }
    final.meta.checksum = body.meta.checksum
    // Commit changes
    this.update((store) => {
      if (store.exists) {
        store.meta.checksum = final.meta.checksum
      }
      return store
    })
    await addToStore<'userID'>('stripe/customer-id', final)
  }

  async delete(this: StripeCustomerIDStore): Promise<void> {
    const store = Store.get(this)
    if (!store.exists) {
      throw new Error('Stripe customer ID doesn\'t exist.')
    }
    const res = await csfetch(route('/stripe/customer-id'), {
      method: 'DELETE',
      headers: {
        'X-Stripe-CryptoKey': await aes.exportKey(store.meta.cryptoKey)
      }
    })
    if (res.status !== 204) {
      throw await HTTPerror(res, 'Failed to delete Stripe customer ID.')
    }
  }

  /** Format the user's Stripe customer address */
  formatAddress(this: StripeCustomerIDStore): string {
    const customer = Store.get(this)
    if (!customer.exists) {
      return ''
    }
    if (customer.address.postalCode != null) {
      return `${customer.address.country}, ${customer.address.postalCode}`
    }
    return customer.address.country
  }
}

export const stripe = new StripeCustomerIDStore()

export default stripe
import { csfetch, HTTPerror, route } from '$lib'
import AccountTypes from '$lib/account-types'
import { Store } from '../store'
import customerIDStore from './customer-id'
import type { Invoice, InvoiceItem } from './invoice'
import { aes } from 'cs-crypto'
import { derived } from 'svelte/store'

export type SubscriptionReq = {
  plan: AccountTypes
  interval: SubscriptionIntervals
}

export enum SubscriptionIntervals {
  Monthly = 1
}

// A recurring subscription for CSplan Pro
export type Subscription = {
  exists: false
} | {
  exists: true
  id: string
  status: SubscriptionStatus

  invoice: Invoice

  items: SubscriptionItem[]

  // Start and end unix timestamps of the current billing period
  periodStart: number
  periodEnd: number
}

export type SubscriptionStatus = 'incomplete' | 'incomplete_expired' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid'
export type SubscriptionItem = InvoiceItem & {
  interval: string // Billing interval i.e "month"
}

class SubscriptionStore extends Store<Subscription> {
  constructor() {
    super({
      exists: false
    })
  }

  async init(this: SubscriptionStore): Promise<void> {
    // Retrieve subscription info
    const res = await csfetch(route('/stripe/subscription'))
    if (res.status === 404) {
      return
    } else if (res.status !== 200) {
      throw await HTTPerror(res, 'Failed to retrieve subscription data from Stripe.')
    }

    const body: Assert<Subscription, 'exists'> = {
      ...await res.json(),
      exists: true
    }
    this.set(body)
  }

  async create(this: SubscriptionStore, subReq: SubscriptionReq): Promise<void> {
    // Ensure customer ID exists
    const stripeCID = Store.get(customerIDStore)
    if (!stripeCID.exists) {
      throw new Error('No Stripe customer ID exists for this user.')
    }
    // Request subscription creation from API
    const res = await csfetch(route('/stripe/subscription'), {
      method: 'POST',
      headers: {
        'X-Stripe-CryptoKey': await aes.exportKey(stripeCID.cryptoKey)
      },
      body: JSON.stringify(subReq)
    })
    if (res.status !== 201) {
      throw await HTTPerror(res, 'Failed to create subscription.')
    }
    // Update subscription information
    const body: Assert<Subscription, 'exists'> = {
      ...await res.json(),
      exists: true
    }
    this.set(body)
  }

  async cancel(this: SubscriptionStore): Promise<void> {
    // Request subscription cancellation/deletion
    const res = await csfetch(route('/stripe/subscription'), {
      method: 'DELETE'
    })
    if (res.status !== 204) {
      throw await HTTPerror(res, 'Failed to cancel subscription.')
    }
    this.set(structuredClone(this.initialValue))
  }
}

export const subscription = new SubscriptionStore()

export default subscription

export const subscriptionInvoice = derived(subscription, (store) => {
  return store.exists ? {
    ...store.invoice,
    exists: true
  } as Invoice : {
    exists: false
  } as Invoice
})
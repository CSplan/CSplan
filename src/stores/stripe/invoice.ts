import { Store } from '../store'
import customerIDStore from './customer-id'
import type AccountTypes from '$lib/account-types' 
import { csfetch, HTTPerror, route } from '$lib'
import { aes } from 'cs-crypto'

export type PrepaidInvoiceReq = {
  plan: Exclude<AccountTypes, AccountTypes.Free>
  months: number
}

export type Invoice = {
  exists: false
} | {
  exists: true
  id: string // Invoice ID
  number?: string // Invoice #, customer scoped
  status: InvoiceStatus
  total: number

  items: InvoiceItem[]

  secret?: string // Client secret for the underlying paymentintent
  invoicePDF?: string // PDF download URL
}

export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'void' | 'uncollectable'

export type InvoiceItem = {
  unitAmount: number // Cost per item in US cents
  amount: number // Total cost in USD cents
  quantity: number // Item quantity
  description: string // Product description for client display i.e: CSplan Pro - 1 Month (Prepaid)
}

class InvoiceStore extends Store<Invoice> {
  constructor() {
    super({
      exists: false
    })
  }

  async init(this: InvoiceStore): Promise<void> { // TODO: implement open Stripe invoice IDB caching
    const res = await csfetch(route('/stripe/invoice'))
    if (res.status === 404) {
      return
    }
    if (res.status !== 200) {
      throw await HTTPerror(res, 'Failed to retrieve open Stripe invoice.')
    }

    // Decode request body
    const body: Assert<Invoice, 'exists'> = await res.json()
    this.set({
      ...body,
      exists: true
    })
  }

  /** Open a new Stripe invoice for 1-12 months of a prepaid plan */
  async create(this: InvoiceStore, invoiceReq: PrepaidInvoiceReq): Promise<void> {
    await this.init()
    if (Store.get(this).exists) {
      await this.delete()
    }
    // Ensure user has an existing Stripe CID to create an invoice using
    const stripeCID = Store.get(customerIDStore)
    if (!stripeCID.exists) {
      throw new Error('No Stripe customer ID exists for this user.')
    }

    // Request the invoice's creation
    const res = await csfetch(route('/stripe/invoice'), {
      method: 'POST',
      headers: {
        'X-Stripe-CryptoKey': await aes.exportKey(stripeCID.meta.cryptoKey)
      },
      body: JSON.stringify(invoiceReq)
    })
    if (res.status !== 201) {
      throw await HTTPerror(res, 'Failed to create invoice.')
    }
    const body: Assert<Invoice, 'exists'> = await res.json()
    this.set({
      ...body,
      exists: true
    })
  }

  /** Finalize a Stripe invoice, should be called immediately before payment to obtain a client secret. */
  async finalize(this: InvoiceStore): Promise<void> {
    if (!Store.get(this).exists) {
      return
    }
    const res = await csfetch(route('/stripe/invoice/finalize'), {
      method: 'POST'
    })
    if (res.status !== 200) {
      throw await HTTPerror(res, 'Failed to finalize invoice.')
    }
    const body: Assert<Invoice, 'exists'> = await res.json()
    this.set({
      ...body,
      exists: true
    })
  }

  /** Delete/Void an open Stripe invoice (cannot be done after the invoice is paid). */
  async delete(this: InvoiceStore): Promise<void> {
    // Ensure the invoice exists before attempting to void
    if (!Store.get(this).exists) {
      throw new Error('No open invoice exists for this user.')
    }

    // Request the invoice is void
    const res = await csfetch(route('/stripe/invoice'), {
      method: 'DELETE'
    })
    if (res.status !== 204) {
      throw await HTTPerror(res, 'Failed to delete Stripe invoice.')
    }
    this.set(this.initialValue)
  }
}

export const invoice = new InvoiceStore()

export default invoice
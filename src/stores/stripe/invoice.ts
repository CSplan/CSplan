import { Store } from '../store'
import AccountTypes from '$lib/account-types' 
import { csfetch, HTTPerror, route } from '$lib'

export type PrepaidInvoiceReq = {
  plan: Exclude<AccountTypes, AccountTypes.Free>
  months: number
}

export type Invoice = {
  exists: false
} | {
  exists: true
  id: string // Invoice ID
  number: string // Invoice #, customer scoped
  status: InvoiceStatus

  items: InvoiceItem[]

  secret: string // Client secret for the underlying paymentintent
  invoicePDF: string // PDF download URL
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

  async init(): Promise<void> {
    const res = await csfetch(route('/stripe/invoice'))
    if (res.status === 404) {
      return
    }
    if (res.status !== 200) {
      throw await HTTPerror(res, 'Failed to retrieve open Stripe invoice.')
    }

    // Decode request body
    const body: Assert<Invoice, 'exists'> = await res.json()
  }
}

export const invoice = new InvoiceStore()

export default invoice
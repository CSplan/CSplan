import AccountTypes from '$lib/account-types'
import { Store } from './store'
import { csfetch, HTTPerror, route } from '$lib'

export type PaymentStatus = {
  accountType: AccountTypes
  paidUntil?: number
  subscribed: number
}

class PaymentStatusStore extends Store<PaymentStatus> {
  declare set: Store<PaymentStatus>['set']
  declare update: Store<PaymentStatus>['update']

  constructor() {
    super({
      accountType: AccountTypes.Free,
      subscribed: 0
    })
  }

  async init(): Promise<void> {
    const res = await csfetch(route('/payment-status'))
    if (res.status !== 200) {
      throw await HTTPerror(res, 'Failed to retrieve payment status.')
    }
    const body: PaymentStatus = await res.json()
    this.set(body)
  }
}

export const paymentStatus = new PaymentStatusStore()

export default paymentStatus
import AccountTypes from '$lib/account-types'
import { Store } from './store'

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
}

export const paymentStatus = new PaymentStatusStore()

export default paymentStatus
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

  /** Format a Unix timestamp for display. */
  formatTimestamp(timestamp: number): string {
    const d = new Date(timestamp * 1000)
    
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const pad = (s: number) => s.toString().padStart(2, '0')

    const offsetHours = Math.floor(d.getTimezoneOffset()/60)
    const offsetMinutes = Math.floor(d.getTimezoneOffset()%60)
    const offset = `UTC${offsetHours > 0 ? '+' : '-'}${Math.abs(offsetHours).toString().padStart(2, '0')}:${Math.abs(offsetMinutes).toString().padStart(2, '0')}`
    return `${pad(d.getHours())}:${pad(d.getMinutes())}, ${pad(d.getMonth())}/${pad(d.getDate())}/${d.getFullYear()} ${offset}`
  }
}

export const paymentStatus = new PaymentStatusStore()

export default paymentStatus
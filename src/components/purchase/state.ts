import { Store } from '$stores/store'
import stripeCID from '$stores/stripe/customer-id'

export type Step = {
  title: string
  id: string
}

export enum PlanTypes {
  Subscription,
  Prepaid
}

export type PurchaseState = {
  steps: Step[]
  currentStep: number
  // The minimum and maximum steps the user may navigate to
  minStep: number
  maxStep: number

  // Plan type
  planType: PlanTypes
  prepaidMonths: number

  // Billing ZIP
  billingCountry: string
  billingZIP: string
}

class PurchaseStateStore extends Store<PurchaseState> {
  declare update: Store<PurchaseState>['update']

  constructor() {
    super({
      steps: [
        {
          id: 'plan_type',
          title: 'Plan Type'
        },
        {
          id: 'billing_zip',
          title: 'Billing ZIP'
        },
        {
          id: 'confirm',
          title: 'Confirm'
        },
        {
          id: 'pay',
          title: 'Pay'
        }
      ],
      currentStep: 0,
      minStep: 0,
      maxStep: 2,
      planType: PlanTypes.Subscription,
      prepaidMonths: 1,
      billingCountry: 'US',
      billingZIP: ''
    })
    // Remove the billing zip step if the user has already registered a billing zip
    const unsubscribe = stripeCID.subscribe((customer) => {
      if (customer.exists) {
        this.update((store) => {
          for (let i = 0; i < store.steps.length; i++) {
            const step = store.steps[i]
            if (step.id === 'billing_zip') {
              store.steps.splice(i, 1)
              store.maxStep--
              unsubscribe()
              break
            }
          }
          return store
        })
      }
    })
  }

  /** Advance to the next purchase step */
  nextStep(this: PurchaseStateStore): void {
    this.update((store) => {
      if (store.currentStep < store.maxStep) {
        store.currentStep++
      }
      return store
    })
  }
  /** Go back to the previous purchase step */
  lastStep(this: PurchaseStateStore): void {
    this.update((store) => {
      if (store.currentStep > store.minStep) {
        store.currentStep--
      }
      return store
    })
  }
}

export const steps = new PurchaseStateStore()

export default steps

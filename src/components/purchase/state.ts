import { Store } from '$stores/store'

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

  planType: PlanTypes
  prepaidMonths: number
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
          id: 'pay',
          title: 'Pay'
        }
      ],
      currentStep: 0,
      minStep: 0,
      maxStep: 1,
      planType: PlanTypes.Subscription,
      prepaidMonths: 1
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

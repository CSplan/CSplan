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

  planType: PlanTypes
  prepaidMonths: number
}

class PurchaseStateStore extends Store<PurchaseState> {
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
      planType: PlanTypes.Subscription,
      prepaidMonths: 1
    })
  }

  nextStep(this: PurchaseStateStore): void {
    this.update((store) => {
      store.currentStep++
      return store
    })
  }

  /** Update the plan type and number of prepaid months to be purchased (if purchasing a prepaid plan) */
  setPlan(this: PurchaseStateStore, planType: PlanTypes, prepaidMonths: number): void {
    this.update((store) => {
      store.planType = planType
      store.prepaidMonths = prepaidMonths
      return store
    })
  }
}

export const steps = new PurchaseStateStore()

export default steps

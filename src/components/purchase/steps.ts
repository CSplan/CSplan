import { Store } from '$stores/store'

export type Steps = {
  steps: string[]
  currentStep: number
}

class StepsStore extends Store<Steps> {
  constructor() {
    super({
      steps: [
        'Plan Type',
        'Payment Method',
        'Billing ZIP',
        'Pay'
      ],
      currentStep: 0
    })
  }
}

export const steps = new StepsStore()

export default steps

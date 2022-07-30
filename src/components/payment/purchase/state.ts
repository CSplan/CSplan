import { Store } from '$stores/store'

export type PurchaseState = {
  step: number
}

class PurchaseStateStore extends Store<PurchaseState> {
  constructor() {
    super({
      step: 0
    })
  }

  nextStep(this: PurchaseStateStore): void {
    this.update((store) => {
      store.step++
      return store
    })
  }
}

export const purchaseState = new PurchaseStateStore()

export default purchaseState
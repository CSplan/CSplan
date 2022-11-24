import { Keys } from '$db/storage'
import { Store } from '../store'
import lists from './lists'

/** Metadata regarding the display of lists in title view. */
export type TitleViewMeta = {
  /** Whether to show archived lists */
  showArchived: boolean
  /** Whether to order lists from bottom to top instead of top to bottom */
  reverseLists: boolean
}

class TitleViewMetaStore extends Store<TitleViewMeta> {
  declare update: Store<TitleViewMeta>['update']

  constructor() {
    super({
      showArchived: false,
      reverseLists: false
    })
  }

  /** Set the showArchived meta property,
   * fetch additional lists and update localStorage accordingly
   */
  async setShowArchived(v: boolean): Promise<void> {
    this.update((store) => {
      store.showArchived = v
      return store
    })
    localStorage.setItem(Keys.ShowArchivedLists, `${v}`)
    if (v) {
      await lists.init('archived')
    }
  }
}

export const titleViewMeta = new TitleViewMetaStore()

export default titleViewMeta
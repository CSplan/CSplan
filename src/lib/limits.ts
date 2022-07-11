type LimitSet = {
  /* List and item liimits */
  // Max total lists
  lists: number
  // Max items in a given list
  itemsPerList: number
  // Max cumulative items across all lists
  totalItems: number
  // Max character length of an item description
  itemDescriptionLen: number

  /* Tag limits */
  // Max total tags
  tags: number
}
type AccountType = 'free'

export const Limits: Record<AccountType, LimitSet> = {
  free: {
    lists: 10,
    itemsPerList: 10,
    totalItems: 50,
    itemDescriptionLen: 2000,

    tags: 10
  }
}

export default Limits
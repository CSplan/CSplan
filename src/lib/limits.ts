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

export const Limits: Record<string, LimitSet> = {
  free: {
    lists: 10,
    itemsPerList: 10,
    totalItems: 50,
    itemDescriptionLen: 2000,

    tags: 10
  },
  pro: {
    lists: 100,
    itemsPerList: 100,
    totalItems: Number.MAX_SAFE_INTEGER,
    itemDescriptionLen: 4000,
    tags: 100
  }
}

export default Limits
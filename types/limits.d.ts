declare type LimitSet = {
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

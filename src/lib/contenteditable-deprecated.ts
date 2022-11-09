/**
 * Process keyboard actions in a contenteditable
 */
export function CEkeypress(evt: KeyboardEvent & SafeEvent): void {
  if (evt.key === 'Enter') {
    evt.currentTarget.blur()
    evt.preventDefault()
  }
}

/**
 * @deprecated
 * Trim a contenteditable element's trailer line breaks, then return the content (ready for storage)
 */
export function CEtrim(evt: SafeEvent): string {
  // Trim any trailing breaks
  evt.currentTarget.innerHTML = evt.currentTarget.innerHTML.replace(/<br>$/, '')
  return evt.currentTarget.innerHTML.replace(/<br>/g, '\n')
}



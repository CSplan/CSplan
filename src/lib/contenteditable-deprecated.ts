/**
 * @deprecated
 * Process keyboard actions in a contenteditable
 */
export function CEkeypress(evt: KeyboardEvent & SafeEvent): void {
  if (evt.key === 'Enter') {
    evt.currentTarget.blur()
    evt.preventDefault()
  }
}



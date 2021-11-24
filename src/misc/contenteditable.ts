type SafeEvent = {
  currentTarget: EventTarget & HTMLElement
}

export function CEkeypress(evt: KeyboardEvent & SafeEvent): void {
  // Unfocus the contenteditable element if the enter key is pressed
  if (evt.key === 'Enter') {
    evt.currentTarget.blur()
    evt.preventDefault()
  }
}

// Trim a contenteditable element's trailer line breaks, then return the content (ready for storage)
export function CEtrim(evt: SafeEvent): string {
  // Trim any trailing breaks
  evt.currentTarget.innerHTML = evt.currentTarget.innerHTML.replace(/<br>$/, '')
  return evt.currentTarget.innerHTML.replace(/<br>/g, '\n')
}



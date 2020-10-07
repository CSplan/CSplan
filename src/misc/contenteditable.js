export function contenteditableKeypress(evt) {
  // Unfocus the contenteditable element if the enter key is pressed
  if (evt.key === 'Enter') {
    evt.preventDefault()
    document.activeElement.blur()
  }
}

export function formElementIsFocused() {
  const els = document.querySelectorAll('[contenteditable], [contenteditable="true"], input, textarea')
  for (const el of els) {
    if (el.contains(document.activeElement)) {
      return true
    }
  }
  return false
}

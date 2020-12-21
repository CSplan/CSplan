export function CEkeypress(evt) {
  // Unfocus the contenteditable element if the enter key is pressed
  if (evt.key === 'Enter') {
    evt.target.blur()
    evt.preventDefault()
  }
}

export function CEtrim(evt) {
  // Trim any trailing breaks
  evt.target.innerHTML = evt.target.innerHTML.replace(/<br>$/, '')
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

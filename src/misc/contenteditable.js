export function contenteditableKeypress(evt) {
  // Unfocus the contenteditable element if the enter key is pressed
  if (evt.key === 'Enter') {
    evt.target.blur()
    evt.preventDefault()
    // Trim the last break added by the keypress
    evt.target.innerHTML = evt.target.innerHTML.replace(/<br>$/, '')
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

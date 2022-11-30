export function formElementIsFocused(): boolean {
  const els = document.querySelectorAll('[contenteditable], [contenteditable="true"], input, textarea')
  for (let i = 0; i < els.length; i++) {
    if (els[i].contains(document.activeElement)) {
      return true
    }
  }
  return false
}
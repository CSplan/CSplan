export function formElementIsFocused(): boolean {
  const els = document.querySelectorAll('[contenteditable], [contenteditable="true"], input, textarea')
  for (const el of els) {
    if (el.contains(document.activeElement)) {
      return true
    }
  }
  return false
}
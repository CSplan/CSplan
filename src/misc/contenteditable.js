export function contenteditableKeypress(evt) {
  // Unfocus the contenteditable element if the enter key is pressed
  if (evt.key === 'Enter') {
    evt.preventDefault()
    document.activeElement.blur()
  }
}
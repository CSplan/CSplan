/**
 * Translate innerHTML (from a contenteditable) to text content for saving
 */
export function html2txt(innerHTML: string|undefined): string {
  if (innerHTML === undefined) {
    return ''
  }
  return innerHTML
    .replace(/<br>$/, '') // Trim any trailing breaks
    .replace(/<br>/g, '\n') // Convert br tags to LFs
}

/**
 * Translate text to innerHTML for display
 */
export function txt2html(txt: string): string {
  return txt
    .replace(/\n$/, '')
    .replace(/\n/g, '<br>')
}
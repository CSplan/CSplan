/**
 * Translate innerHTML (from a contenteditable) to text content for saving
 */
export function html2txt(innerHTML: string): string {
  return innerHTML
    .replace(/<br>$/, '') // Trim any trailing breaks
    .replace(/<br>/g, '\n') // Convert br tags to LFs
}
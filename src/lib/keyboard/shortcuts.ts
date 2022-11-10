/**
 * A set of keyboard shortcuts which provides an event handler to process keypress events.
 * NOTE: consult https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values for specialty key names
 */
export class Shortcuts extends Map<[key: string, withCtrl?: boolean], () => void> {
  /** Whether to block shortcuts when a contenteditable or input is focused */
  private blockWhileTyping = true
  /** Whether to make shortcuts for [A-Z] case insensitive*/
  private caseInsensitive = true

  private static readonly EditableElements = [
    '[contenteditable]',
    'contenteditable="true"]',
    'input',
    'textarea'
  ].join(',')

  constructor(args?: {
    blockWhileTyping?: boolean
    caseInsensitive?: boolean
  }) {
    super()
    if (args !== undefined) {
      if (args.blockWhileTyping !== undefined) {
        this.blockWhileTyping = args.blockWhileTyping
      }
      if (args.caseInsensitive !== undefined) {
        this.caseInsensitive = args.caseInsensitive
      }
    }
  }

  /**
   * @override
   */
  set(key: [string, boolean], fn: () => void): this {
    if (this.caseInsensitive) {
      key[0] = key[0].toLowerCase()
    }
    super.set(key, fn)
    return this
  }

  handler(evt: KeyboardEvent): void {
    // Prevent event handler from running while a text input or editable element is focused
    if (this.blockWhileTyping) {
      const els = document.querySelectorAll(Shortcuts.EditableElements)
      for (let i = 0; i < els.length; i++) {
        if (els.item(i).contains(document.activeElement)) {
          return
        }
      }
    }
    // Normalize key name to lowercase if case insensitive
    const key = this.caseInsensitive ? evt.key.toLowerCase() : evt.key
    const fn = super.get([key, evt.ctrlKey])
    if (fn !== undefined) { // If the shortcut handler exists, run it
      fn()
    }
  }
}
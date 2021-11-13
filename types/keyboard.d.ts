declare type KeyboardShortcut = {
  handler: () => void
  ignoreInForm: boolean // Whether or not to ignore the shortcut if it's triggered while a form element is focused, should default to true
}
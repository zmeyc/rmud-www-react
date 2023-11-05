export function isPrintableKey(event: KeyboardEvent) {
  // Array is needed for splitting multibyte chars
  return [...event.key].length === 1 && !event.ctrlKey && !event.metaKey
}

export function replaceNewLinesWithSpaces(text: string) {
  return text.replace(/\r?\n|\r/g, " ")
}

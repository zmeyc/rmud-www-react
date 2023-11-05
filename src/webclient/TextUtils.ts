export function replaceBellsWithBlinks(text: string) {
  return text.replace(/\u0007/g, "<span class='blink'>❗</span>")
}

export function escapeHTML(unsafe: string) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
}

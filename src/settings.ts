export function gameUrl() {
  const hostname = document.location.hostname
  if (hostname === "rmud.org") {
    return "wss://rmud.org:4040"
  }
  return `ws://${hostname}:4040`
}

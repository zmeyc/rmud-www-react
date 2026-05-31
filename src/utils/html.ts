const readyAttribute = "data-ready"

export function isInitialized(element: HTMLElement) {
  return element.getAttribute(readyAttribute) !== null
}

export function setInitialized(element: HTMLElement) {
  element.setAttribute(readyAttribute, "true")
}

export function loadCssFile(href: string, document: Document) {
  const cssLink = document.createElement("link")
  cssLink.href = href
  cssLink.rel = "stylesheet"
  cssLink.type = "text/css"
  document.head.appendChild(cssLink)
}

export function isScrolledToBottom(
  element: HTMLElement,
  maximumRoundingError = 3,
) {
  // clientHeight, scrollTop, and clientHeight are all rounded
  return (
    element.scrollHeight - element.clientHeight <=
    element.scrollTop + maximumRoundingError
  )
}

export function scrollToBottom(body: HTMLElement) {
  body.scrollTop = body.scrollHeight - body.clientHeight
}

export function getStyleVarValue(name: string) {
  return window
    .getComputedStyle(document.documentElement)
    .getPropertyValue(name)
}

export function setStyleVarValue(name: string, value: string) {
  document.documentElement.style.setProperty(name, value)
}

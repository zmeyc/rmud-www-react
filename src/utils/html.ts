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

export function injectCssString(css: string, document: Document) {
  const node = document.createTextNode(css)

  const style = document.createElement("style")
  style.appendChild(node)
  document.head.appendChild(style)
}

export function isScrolledToBottom(body: HTMLElement) {
  // clientHeight, scrollTop, and clientHeight are all rounded
  const maximumRoundingError = 3
  return (
    body.scrollHeight - body.clientHeight <=
    body.scrollTop + maximumRoundingError
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

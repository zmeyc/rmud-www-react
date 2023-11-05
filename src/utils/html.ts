const readyAttribute = "data-ready"

export function isInitialized(element: HTMLElement) {
  return element.getAttribute(readyAttribute) !== null
}

export function setInitialized(element: HTMLElement) {
  element.setAttribute(readyAttribute, "true")
}

export function loadCssFile(href: string, document: Document) {
  var cssLink = document.createElement("link")
  cssLink.href = href
  cssLink.rel = "stylesheet"
  cssLink.type = "text/css"
  document.head.appendChild(cssLink)
}

export function injectCssString(css: string, document: Document) {
  const node = document.createTextNode(css)

  var style = document.createElement("style")
  style.appendChild(node)
  document.head.appendChild(style)
}

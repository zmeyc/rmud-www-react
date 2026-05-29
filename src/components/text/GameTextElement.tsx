import { ForwardedRef, Ref, useImperativeHandle } from "preact/compat"
import { isScrolledToBottom, scrollToBottom } from "../../utils/html"

export interface GameTextElement {
  append: (text: string) => void
  appendLink: (text: string, href: string) => void
  clear: () => void
  scrollToBottom: () => void
}

function isHttpUrl(href: string) {
  try {
    const url = new URL(href)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

export function useGameTextElement(
  ref: ForwardedRef<GameTextElement>,
  containerRef: Ref<HTMLDivElement>,
  preRef: Ref<HTMLPreElement>,
) {
  useImperativeHandle(
    ref,
    () => ({
      append: (text: string) => {
        const pre = preRef.current
        if (pre === null) {
          return
        }
        const span = document.createElement("span")
        span.role = "alert"
        span.innerHTML = text
        pre.appendChild(span)
      },
      appendLink: (text: string, href: string) => {
        const pre = preRef.current
        if (pre === null) {
          return
        }
        const span = document.createElement("span")
        span.role = "alert"
        if (isHttpUrl(href)) {
          const link = document.createElement("a")
          link.href = href
          link.target = "_blank"
          link.rel = "noopener noreferrer"
          link.textContent = text
          span.appendChild(link)
        } else {
          span.textContent = text
        }
        pre.appendChild(span)
      },
      clear: () => {
        const pre = preRef.current
        if (pre === null) {
          return
        }
        pre.innerHTML = ""
      },
      scrollToBottom: () => {
        const container = containerRef.current
        if (container === null) {
          return
        }
        if (!isScrolledToBottom(container)) {
          scrollToBottom(container)
        }
      },
    }),
    [containerRef, preRef],
  )
}

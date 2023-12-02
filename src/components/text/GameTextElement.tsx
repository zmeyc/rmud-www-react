import { ForwardedRef, Ref, useImperativeHandle } from "preact/compat"
import { isScrolledToBottom, scrollToBottom } from "../../utils/html"

export interface GameTextElement {
  append: (text: string) => void
  clear: () => void
  scrollToBottom: () => void
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

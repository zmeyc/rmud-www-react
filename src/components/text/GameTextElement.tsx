import { ForwardedRef, Ref, useImperativeHandle } from "preact/compat"
import { isScrolledToBottom, scrollToBottom } from "../../utils/html"

export interface GameTextElement {
  append: (text: string) => void
  clear: () => void
  scrollToBottom: () => void
  contentWindow: () => Window | null
}

export function useGameTextElement(
  ref: ForwardedRef<GameTextElement>,
  iframeRef: Ref<HTMLIFrameElement>,
  paragraphRef: Ref<HTMLParagraphElement>,
) {
  useImperativeHandle(
    ref,
    () => ({
      append: (text: string) => {
        const paragraph = paragraphRef.current
        if (paragraph === null) {
          return
        }
        paragraph.innerHTML += text
      },
      clear: () => {
        const paragraph = paragraphRef.current
        if (paragraph === null) {
          return
        }
        paragraph.innerHTML = ""
      },
      scrollToBottom: () => {
        const body = iframeRef.current?.contentWindow?.document.body
        if (body === undefined) {
          return
        }
        if (!isScrolledToBottom(body)) {
          scrollToBottom(body)
        }
      },
      contentWindow: () => {
        const iframe = iframeRef.current
        if (iframe === null) {
          return null
        }
        return iframe.contentWindow
      },
    }),
    [iframeRef, paragraphRef],
  )
}

import { ForwardedRef, Ref, useImperativeHandle } from "preact/compat"

export interface GameTextElement {
  append: (text: string) => void
  clear: () => void
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
      contentWindow: () => {
        const iframe = iframeRef.current
        if (iframe === null) {
          return null
        }
        return iframe.contentWindow
      },
    }),
    [],
  )
}

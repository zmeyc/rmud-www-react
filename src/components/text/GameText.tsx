import {
  ComponentProps,
  forwardRef,
  memo,
  useEffect,
  useRef,
} from "preact/compat"
import cn from "classnames"
import {
  injectCssString,
  isInitialized,
  setInitialized,
} from "../../utils/html"
import indexCss from "../../assets/styles/index.css?inline"
import blinkCss from "../../assets/styles/blink.css?inline"
import { GameTextElement, useGameTextElement } from "./GameTextElement"
import gameTextCss from "./GameTextIFrame.css?inline"
import styles from "./GameText.module.css"

export interface GameTextProps extends ComponentProps<"iframe"> {
  className?: string
}

export const GameText = memo(
  forwardRef<GameTextElement, GameTextProps>(({ className, ...props }, ref) => {
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const paragraphRef = useRef<HTMLParagraphElement | null>(null)

    useEffect(() => {
      const iframe = iframeRef.current
      if (iframe === null) {
        return
      }

      const contentWindow = iframe.contentWindow
      if (contentWindow === null) {
        return
      }

      if (isInitialized(iframe)) {
        return
      }
      setInitialized(iframe)

      const document = contentWindow.document

      injectCssString(indexCss, document)
      injectCssString(blinkCss, document)
      injectCssString(gameTextCss, document)

      const gameTextParagraph = document.createElement("p")
      gameTextParagraph.className = "gameText"
      document.body.appendChild(gameTextParagraph)

      paragraphRef.current = gameTextParagraph
    }, [])

    useGameTextElement(ref, iframeRef, paragraphRef)

    return (
      <iframe
        {...props}
        className={cn(styles.root, className)}
        ref={iframeRef}
      />
    )
  }),
)
GameText.displayName = "GameText"

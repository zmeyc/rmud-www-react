import { ComponentProps, FC, RefObject, memo, useEffect } from "preact/compat"
import cn from "classnames"
import {
  injectCssString,
  isInitialized,
  setInitialized,
} from "../../utils/html"
import indexCss from "../../assets/styles/index.css?inline"
import blinkCss from "../../assets/styles/blink.css?inline"
import gameTextCss from "./GameTextIFrame.css?inline"
import styles from "./GameText.module.css"

export interface GameTextProps extends ComponentProps<"iframe"> {
  className?: string
  iframeRef: RefObject<HTMLIFrameElement>
  paragraphRef: RefObject<HTMLParagraphElement>
}

export const GameText: FC<GameTextProps> = memo(
  ({ className, iframeRef, paragraphRef, ...props }) => {
    //const iframeRef = useRef<HTMLIFrameElement>(null)

    useEffect(() => {
      const iframe = iframeRef.current
      if (iframe === null || isInitialized(iframe)) {
        return
      }
      setInitialized(iframe)

      const contentWindow = iframe.contentWindow
      if (contentWindow === null) {
        return
      }

      const document = contentWindow.document

      injectCssString(indexCss, document)
      injectCssString(blinkCss, document)
      injectCssString(gameTextCss, document)

      const gameTextParagraph = document.createElement("p")
      gameTextParagraph.className = "gameText"
      document.body.appendChild(gameTextParagraph)

      paragraphRef.current = gameTextParagraph
    }, [])

    return (
      <iframe
        {...props}
        className={cn(styles.root, className)}
        ref={iframeRef}
      />
    )
  },
)
GameText.displayName = "GameText"

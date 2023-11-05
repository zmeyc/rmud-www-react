import {
  ComponentProps,
  FC,
  memo,
  useEffect,
  useRef,
  useState,
} from "preact/compat"
import cn from "classnames"
import { BarePage } from "../pageparts/pages/BarePage"
import { GameText } from "../components/text/GameText"
import { AutoGrowingTextArea } from "../components/inputs/AutoGrowingTextArea"
import { AutoGrowingTextAreaElement } from "../components/inputs/AutoGrowingTextAreaElement"
import { WebClient, WebClientCallbacks } from "../webclient/WebClient"
import styles from "./PlayPage.module.css"

export interface PlayPageProps extends ComponentProps<"div"> {
  className?: string
}

export const PlayPage: FC<PlayPageProps> = memo(({ className, ...props }) => {
  const gameTextIframeRef = useRef<HTMLIFrameElement>(null)
  const gameTextParagraphRef = useRef<HTMLParagraphElement>(null)
  const userInputRef = useRef<AutoGrowingTextAreaElement>(null)

  const [isFirstCommand, setIsFirstCommand] = useState(true)

  useEffect(() => {
    const gameTextIframe = gameTextIframeRef.current
    if (gameTextIframe === null) {
      return
    }
    const iframeWindow = gameTextIframe.contentWindow
    if (iframeWindow === null) {
      return
    }

    const gameTextParagraph = gameTextParagraphRef.current
    if (gameTextParagraph === null) {
      return
    }
    const userInput = userInputRef.current
    if (userInput === null) {
      return
    }
    userInput.focus()

    const listenKeyboardEventsOn = [window, iframeWindow]
    const callbacks: WebClientCallbacks = {
      onResetGameText: () => {
        gameTextParagraph.innerHTML = ""
      },
      onAppendToGameText: (text: string) => {
        gameTextParagraph.innerHTML += text
      },
      onGetUserInput: (): string => {
        return userInput.value()
      },
      onResetUserInput: () => {
        userInput.setValue("")
        setIsFirstCommand(false)
      },
      onFocusUserInput: () => {
        userInput.focus()
      },
    }
    const webClient = new WebClient(listenKeyboardEventsOn, callbacks)
    webClient.registerHotkeyListener()
    webClient.connect("ws://localhost:4040")

    return () => {
      webClient.disconnect()
      webClient.unregisterHotkeyListener()
    }
  }, [])

  return (
    <BarePage {...props} className={cn(className, styles.root)}>
      <div className={styles.content}>
        <GameText
          className={styles.gameText}
          iframeRef={gameTextIframeRef}
          paragraphRef={gameTextParagraphRef}
        />
        <AutoGrowingTextArea
          ref={userInputRef}
          placeholder={isFirstCommand ? "Введите команду" : undefined}
        />
      </div>
    </BarePage>
  )
})
PlayPage.displayName = "PlayPage"

import {
  ComponentProps,
  FC,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "preact/compat"
import cn from "classnames"
import { BarePage } from "../pageparts/pages/BarePage"
import { GameText } from "../components/text/GameText"
import { AutoGrowingTextArea } from "../components/inputs/AutoGrowingTextArea"
import { AutoGrowingTextAreaElement } from "../components/inputs/AutoGrowingTextAreaElement"
import { GameTextElement } from "../components/text/GameTextElement"
import { WebClient, WebClientCallbacks } from "../webclient/WebClient"
import styles from "./PlayPage.module.css"

export interface PlayPageProps extends ComponentProps<"div"> {
  className?: string
}

export const PlayPage: FC<PlayPageProps> = memo(({ className, ...props }) => {
  const gameTextRef = useRef<GameTextElement>(null)
  const userInputRef = useRef<AutoGrowingTextAreaElement>(null)

  const [isFirstCommand, setIsFirstCommand] = useState(true)

  useEffect(() => {
    const gameText = gameTextRef.current
    if (gameText === null) {
      return
    }
    const iframeWindow = gameText.contentWindow()
    if (iframeWindow === null) {
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
        gameText.clear()
      },
      onAppendToGameText: (text: string) => {
        gameText.append(text)
        gameText.scrollToBottom()
      },
      onGetUserInput: (): string => {
        return userInput.value()
      },
      onResetUserInput: () => {
        userInput.clear()
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

  const handleDidChangeUserInputSize = useCallback(() => {
    gameTextRef.current?.scrollToBottom()
  }, [])

  return (
    <BarePage
      {...props}
      className={cn(className, styles.root)}
    >
      <div className={styles.content}>
        <GameText
          className={styles.gameText}
          ref={gameTextRef}
        />
        <AutoGrowingTextArea
          className={styles.commandInput}
          ref={userInputRef}
          placeholder={isFirstCommand ? "Введите команду" : undefined}
          onDidChangeTextAreaSize={handleDidChangeUserInputSize}
        />
      </div>
    </BarePage>
  )
})
PlayPage.displayName = "PlayPage"

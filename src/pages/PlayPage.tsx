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
import { MaskedInput } from "../components/inputs/MaskedInput"
import { MaskedInputElement } from "../components/inputs/MaskedInputElement"
import { isInitialized, setInitialized } from "../utils/html"
import styles from "./PlayPage.module.css"

export interface PlayPageProps extends ComponentProps<"div"> {
  className?: string
}

export const PlayPage: FC<PlayPageProps> = memo(({ className, ...props }) => {
  const pageRef = useRef<HTMLDivElement>(null)
  const gameTextRef = useRef<GameTextElement>(null)
  const userInputRef = useRef<AutoGrowingTextAreaElement>(null)
  const maskedInputRef = useRef<MaskedInputElement>(null)

  const [isFirstCommand, setIsFirstCommand] = useState(true)

  const inputHadFocusHint = useRef(false)
  const [isMaskedInput, setIsMaskedInput] = useState(false)

  useEffect(() => {
    const page = pageRef.current
    if (page === null) {
      return
    }

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

    const maskedInput = maskedInputRef.current
    if (maskedInput === null) {
      return
    }

    if (isInitialized(page)) {
      return
    }
    setInitialized(page)

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
      onEchoOff: () => {
        inputHadFocusHint.current = userInput.isFocused()
        maskedInput.setValue(userInput.value().replace(/\r?\n|\r/g, " "))
        userInput.clear()
        setIsMaskedInput(true)
      },
      onEchoOn: () => {
        inputHadFocusHint.current = maskedInput.isFocused()
        userInput.setValue(maskedInput.value())
        maskedInput.clear()
        setIsMaskedInput(false)
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

  useEffect(() => {
    if (!inputHadFocusHint.current) {
      return
    }
    inputHadFocusHint.current = false

    if (isMaskedInput) {
      maskedInputRef.current?.focus()
    } else {
      userInputRef.current?.focus()
    }
  }, [isMaskedInput])

  const handleDidChangeUserInputSize = useCallback(() => {
    gameTextRef.current?.scrollToBottom()
  }, [])

  return (
    <BarePage
      {...props}
      className={cn(className, styles.root)}
      ref={pageRef}
    >
      <div className={styles.content}>
        <GameText
          className={styles.gameText}
          ref={gameTextRef}
        />
        <AutoGrowingTextArea
          className={cn(styles.commandInput, {
            [styles.commandInputActive]: !isMaskedInput,
          })}
          ref={userInputRef}
          placeholder={isFirstCommand ? "Введите команду" : undefined}
          onDidChangeTextAreaSize={handleDidChangeUserInputSize}
        />
        <MaskedInput
          className={cn(styles.maskedInput, {
            [styles.maskedInputActive]: isMaskedInput,
          })}
          ref={maskedInputRef}
          placeholder="Введите пароль"
        />
      </div>
    </BarePage>
  )
})
PlayPage.displayName = "PlayPage"

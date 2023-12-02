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
import { WebClient } from "../webclient/WebClient"
import { MaskedInput } from "../components/inputs/MaskedInput"
import { MaskedInputElement } from "../components/inputs/MaskedInputElement"
import { useVisualViewportHeight } from "../hooks/useVisualViewportHeight"
import { isInitialized, setInitialized, setStyleVarValue } from "../utils/html"
import { replaceNewLinesWithSpaces } from "../utils/string"
import { gameUrl, isDebug } from "../settings"
import styles from "./PlayPage.module.css"

export interface PlayPageProps extends ComponentProps<"div"> {
  className?: string
}

export const PlayPage: FC<PlayPageProps> = memo(({ className, ...props }) => {
  const pageRef = useRef<HTMLDivElement>(null)
  const gameTextRef = useRef<GameTextElement>(null)
  const userInputRef = useRef<AutoGrowingTextAreaElement>(null)
  const maskedInputRef = useRef<MaskedInputElement>(null)

  const [webClient, setWebClient] = useState<WebClient>()

  const [isFirstCommand, setIsFirstCommand] = useState(true)

  const inputHadFocusHint = useRef(false)
  const [isMaskedInput, setIsMaskedInput] = useState(false)

  const viewportHeight = useVisualViewportHeight()

  useEffect(() => {
    setStyleVarValue("--fullscreen-height", viewportHeight)
  }, [viewportHeight])

  useEffect(() => {
    const page = pageRef.current
    if (page === null) {
      return
    }

    const gameText = gameTextRef.current
    if (gameText === null) {
      return
    }
    const userInput = userInputRef.current
    if (userInput === null) {
      return
    }

    if (isInitialized(page)) {
      return
    }
    setInitialized(page)

    userInput.focus()

    const listenKeyboardEventsOn = [window]
    const webClient = new WebClient(listenKeyboardEventsOn)
    webClient.registerHotkeyListener()
    webClient.connect(gameUrl())
    setWebClient(webClient)

    return () => {
      webClient.disconnect()
      webClient.unregisterHotkeyListener()
    }
  }, [])

  useEffect(() => {
    if (webClient === undefined) {
      return
    }

    const gameText = gameTextRef.current
    if (gameText === null) {
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

    webClient.callbacks = {
      onResetGameText: () => {
        gameText.clear()
      },
      onAppendToGameText: (text: string) => {
        gameText.append(text)
        gameText.scrollToBottom()
      },
      onGetUserInput: (): string => {
        return isMaskedInput ? maskedInput.value() : userInput.value()
      },
      onResetUserInput: () => {
        if (isMaskedInput) {
          maskedInput.clear()
        } else {
          userInput.clear()
        }
        setIsFirstCommand(false)
      },
      onFocusUserInput: () => {
        if (isMaskedInput) {
          maskedInput.focus()
        } else {
          userInput.focus()
        }
      },
      onEchoOff: () => {
        if (isMaskedInput) {
          return
        }
        inputHadFocusHint.current = userInput.isFocused()
        maskedInput.setValue(replaceNewLinesWithSpaces(userInput.value()))
        userInput.clear()
        setIsMaskedInput(true)
      },
      onEchoOn: () => {
        if (!isMaskedInput) {
          return
        }
        inputHadFocusHint.current = maskedInput.isFocused()
        userInput.setValue(maskedInput.value())
        maskedInput.clear()
        setIsMaskedInput(false)
      },
    }
  }, [isMaskedInput, webClient])

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

  const debugInfo = isDebug ? (
    <div className={styles.debugInfo}>{gameUrl()}</div>
  ) : null

  return (
    <BarePage
      {...props}
      className={cn(className, styles.root)}
      ref={pageRef}
    >
      {debugInfo}
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
    </BarePage>
  )
})
PlayPage.displayName = "PlayPage"

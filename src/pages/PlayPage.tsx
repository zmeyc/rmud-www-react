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
import { WidgetLayout } from "../widgets/components/WidgetLayout"
import { MirrorWidget, type MirrorWidgetItem } from "../widgets/MirrorWidget"
import { usePlayMirrorEnabled } from "./hooks/usePlayMirrorEnabled"
import { PlaySettingsDialog } from "./PlaySettingsDialog"
import styles from "./PlayPage.module.css"

export interface PlayPageProps extends ComponentProps<"div"> {
  className?: string
}

type GameTextMirrorItemContent =
  | {
      type: "html"
      html: string
    }
  | {
      type: "link"
      text: string
      href: string
    }

const maximumGameTextMirrorItems = 120

export const PlayPage: FC<PlayPageProps> = memo(({ className, ...props }) => {
  const pageRef = useRef<HTMLDivElement>(null)
  const gameTextRef = useRef<GameTextElement>(null)
  const userInputRef = useRef<AutoGrowingTextAreaElement>(null)
  const maskedInputRef = useRef<MaskedInputElement>(null)

  const [webClient, setWebClient] = useState<WebClient>()

  const [isFirstCommand, setIsFirstCommand] = useState(true)

  const inputHadFocusHint = useRef(false)
  const [isMaskedInput, setIsMaskedInput] = useState(false)
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false)
  const [isMirrorEnabled, setIsMirrorEnabled] = usePlayMirrorEnabled()
  const gameTextMirrorItemId = useRef(0)
  const [gameTextMirrorItems, setGameTextMirrorItems] = useState<
    MirrorWidgetItem[]
  >([])
  const [isGameTextScrolledToBottom, setIsGameTextScrolledToBottom] =
    useState(true)

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

  const appendGameTextMirrorItem = useCallback(
    (item: GameTextMirrorItemContent) => {
      const id = gameTextMirrorItemId.current
      gameTextMirrorItemId.current += 1

      setGameTextMirrorItems((currentItems) => {
        const nextItems = [...currentItems, { id, ...item }]

        return nextItems.length > maximumGameTextMirrorItems
          ? nextItems.slice(nextItems.length - maximumGameTextMirrorItems)
          : nextItems
      })
    },
    [],
  )

  const appendGameText = useCallback(
    (append: (gameText: GameTextElement) => void) => {
      const gameText = gameTextRef.current
      if (gameText === null) {
        return
      }

      const wasScrolledToBottom = gameText.isScrolledToBottom()
      append(gameText)

      if (wasScrolledToBottom) {
        gameText.scrollToBottom()
      }

      setIsGameTextScrolledToBottom(gameText.isScrolledToBottom())
    },
    [],
  )

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
        gameTextMirrorItemId.current = 0
        setGameTextMirrorItems([])
        setIsGameTextScrolledToBottom(true)
      },
      onAppendToGameText: (text: string) => {
        appendGameText((gameText) => {
          gameText.append(text)
        })
        appendGameTextMirrorItem({ type: "html", html: text })
      },
      onAppendLinkToGameText: (text: string, href: string) => {
        appendGameText((gameText) => {
          gameText.appendLink(text, href)
        })
        appendGameTextMirrorItem({ type: "link", text, href })
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
  }, [appendGameText, appendGameTextMirrorItem, isMaskedInput, webClient])

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
    const gameText = gameTextRef.current
    if (gameText === null) {
      return
    }

    if (isGameTextScrolledToBottom) {
      gameText.scrollToBottom()
    }

    setIsGameTextScrolledToBottom(gameText.isScrolledToBottom())
  }, [isGameTextScrolledToBottom])

  const handleSendWidgetCommand = useCallback(
    (command: string) => {
      webClient?.sendCommand(command)
      if (isMaskedInput) {
        maskedInputRef.current?.focus()
      } else {
        userInputRef.current?.focus()
      }
    },
    [isMaskedInput, webClient],
  )

  const handleOpenSettingsDialog = useCallback(() => {
    setIsSettingsDialogOpen(true)
  }, [])

  const handleCloseSettingsDialog = useCallback(() => {
    setIsSettingsDialogOpen(false)
    if (isMaskedInput) {
      maskedInputRef.current?.focus()
    } else {
      userInputRef.current?.focus()
    }
  }, [isMaskedInput])

  const debugInfo = isDebug ? (
    <div className={styles.debugInfo}>{gameUrl()}</div>
  ) : null
  const mirrorWidget =
    isMirrorEnabled &&
    !isGameTextScrolledToBottom &&
    gameTextMirrorItems.length > 0 ? (
      <MirrorWidget
        className={styles.mirrorWidget}
        items={gameTextMirrorItems}
      />
    ) : null
  const settingsDialog = isSettingsDialogOpen ? (
    <PlaySettingsDialog
      isMirrorEnabled={isMirrorEnabled}
      onClose={handleCloseSettingsDialog}
      onMirrorEnabledChange={setIsMirrorEnabled}
    />
  ) : null

  return (
    <BarePage
      {...props}
      className={cn(className, styles.root)}
      ref={pageRef}
    >
      {debugInfo}
      <WidgetLayout
        className={styles.playSurface}
        onSendCommand={handleSendWidgetCommand}
      >
        <div className={styles.mainArea}>
          <GameText
            className={styles.gameText}
            ref={gameTextRef}
            onScrolledToBottomChange={setIsGameTextScrolledToBottom}
          />
          {mirrorWidget}
          <div className={styles.inputArea}>
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
            <button
              aria-label="Настройки"
              className={styles.settingsButton}
              title="Настройки"
              type="button"
              onClick={handleOpenSettingsDialog}
            >
              [*]
            </button>
          </div>
        </div>
      </WidgetLayout>
      {settingsDialog}
    </BarePage>
  )
})
PlayPage.displayName = "PlayPage"

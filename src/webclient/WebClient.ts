import { AnsiFilter } from "./AnsiToHtml"
import { Hotkeys } from "./Hotkeys"
import { descriptionForCloseEventCode } from "./CloseEventCode"
import { AnsiText, GameEvent, Link, StreamCommand } from "./GameEvent"
import { escapeHTML, replaceBellsWithBlinks } from "./TextUtils"

export interface WebClientCallbacks {
  onResetGameText: () => void
  onAppendToGameText: (text: string) => void
  onAppendLinkToGameText: (text: string, href: string) => void
  onGetUserInput: () => string
  onResetUserInput: () => void
  onFocusUserInput: () => void
  onEchoOff: () => void
  onEchoOn: () => void
}

export class WebClient {
  public callbacks?: WebClientCallbacks

  private url = ""
  private connected = false
  private ws?: WebSocket
  private ansiFilter = new AnsiFilter()
  private hotkeys: Hotkeys

  constructor(private listenKeyboardEventsOn: Window[]) {
    this.hotkeys = new Hotkeys(this.listenKeyboardEventsOn, {
      onSendUserInput: this.handleSendUserInput,
      onFocusUserInput: this.handleFocusUserInput,
      onSendCommand: this.handleSendCommand,
    })
  }

  registerHotkeyListener = () => {
    this.hotkeys.registerHotkeyListener()
  }

  unregisterHotkeyListener = () => {
    this.hotkeys.unregisterHotkeyListener()
  }

  connect = (url: string) => {
    this.disconnect()

    this.url = url
    this.ws = new WebSocket(this.url)

    this.ws.onopen = this.handleOpen
    this.ws.onclose = this.handleClose
    this.ws.onmessage = this.handleMessage
  }

  disconnect = () => {
    if (this.ws === undefined) {
      return
    }
    try {
      this.ws.close()
    } finally {
      this.ws = undefined
      console.log("Disconnected from: %s", this.url)
    }
  }

  isConnected = () => {
    return this.ws != undefined
  }

  sendCommand = (command: string) => {
    const message = {
      type: "command",
      text: command,
    }
    this.ws?.send(JSON.stringify(message))
  }

  private handleOpen = (_ev: Event) => {
    this.connected = true
    console.log("Connected to: %s", this.url)
    this.callbacks?.onResetGameText()
  }

  private handleClose = (ev: CloseEvent) => {
    if (!this.connected) {
      this.callbacks?.onAppendToGameText(
        "<br />Не удается установить соединение с сервером.",
      )
      return
    }
    const reason = descriptionForCloseEventCode(ev.code)
    this.callbacks?.onAppendToGameText(`<br />${reason}`)
    console.log("Disconnect from: %s", this.url)
  }

  private handleMessage = (ev: MessageEvent<unknown>) => {
    const data = ev.data
    if (typeof data !== "string") {
      return
    }
    const message: GameEvent = JSON.parse(data) as GameEvent
    switch (message.type) {
      case "ansiText":
        this.handleAnsiText(message)
        break
      case "streamCommand":
        this.handleStreamCommand(message)
        break
      case "link":
        this.handleLink(message)
        break
    }
  }

  private handleAnsiText = (message: AnsiText) => {
    const escaped = escapeHTML(message.text)
    const html = this.ansiFilter.toHtml(escaped)
    const finalText = replaceBellsWithBlinks(html)
    this.callbacks?.onAppendToGameText(finalText)
  }

  private handleStreamCommand = (message: StreamCommand) => {
    switch (message.command) {
      case "echoOff":
        this.callbacks?.onEchoOff()
        break
      case "echoOn":
        this.callbacks?.onEchoOn()
        break
      default:
        console.error("Unknown command: %s", message.command)
        break
    }
  }

  private handleLink = (message: Link) => {
    this.callbacks?.onAppendLinkToGameText(message.text, message.href)
  }

  private handleSendUserInput = () => {
    const userInput = this.callbacks?.onGetUserInput() ?? ""
    this.sendCommand(userInput)
    this.callbacks?.onResetUserInput()
  }

  private handleFocusUserInput = () => {
    this.callbacks?.onFocusUserInput()
  }

  private handleSendCommand = (command: string) => {
    this.sendCommand(command)
  }
}

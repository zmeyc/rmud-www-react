import {
  goDownCommand,
  goEastCommand,
  goNorthCommand,
  goSouthCommand,
  goUpCommand,
  goWestCommand,
} from "./MovementCommands"

export interface HotkeyCallbacks {
  onSendUserInput: () => void
  onFocusUserInput: () => void
  onSendCommand: (command: string) => void
}

export class Hotkeys {
  constructor(
    private listenKeyboardEventsOn: Window[],
    private callbacks: HotkeyCallbacks,
  ) {}

  registerHotkeyListener = () => {
    for (const window of this.listenKeyboardEventsOn) {
      window.addEventListener("keydown", this.handleKeydown, {
        capture: true, // capture as early as possible
      })
    }
  }

  unregisterHotkeyListener = () => {
    for (const window of this.listenKeyboardEventsOn) {
      window.removeEventListener("keydown", this.handleKeydown, {
        capture: true,
      })
    }
  }

  private handleKeydown = (event: KeyboardEvent) => {
    this.debugLogKeyboardEvent(event)

    if (event.defaultPrevented) {
      return // Should do nothing if the default action has been cancelled
    }

    let inputHandled = false
    // TODO
    /* if (event.key !== undefined) {
          // Handle the event with KeyboardEvent.key and set handled true.
      } else if (event.keyIdentifier !== undefined) { // Safari
          // Handle the event with KeyboardEvent.keyIdentifier and set handled true.
      } else*/
    // Handle in backward compatible way
    inputHandled = this.handleKeydownWithKeycode(event)
    if (inputHandled) {
      // Suppress "double action" if event handled
      event.preventDefault()
      this.callbacks.onFocusUserInput()
    }
  }

  private handleKeydownWithKeycode = (event: KeyboardEvent) => {
    let inputHandled = false
    switch (event.keyCode) {
      case 13: // return
      case 14: // enter
        if (!event.shiftKey) {
          if (!event.repeat) {
            this.callbacks.onSendUserInput()
          }
          inputHandled = true
        }
        break

      case 27: // escape
        // Every handled button also focuses user input,
        // which is the primary action for ESC
        inputHandled = true
        break

      case 105: // numpad page up in Safari and Firefox. Chrome returns keycode 57 + code 'Numpad9' instead.
        if (!event.repeat) {
          this.callbacks.onSendCommand(goUpCommand)
        }
        inputHandled = true
        break
      case 57: // '9'
        if (event.code == "Numpad9") {
          if (!event.repeat) {
            this.callbacks.onSendCommand(goUpCommand)
          }
          inputHandled = true
        }
        break
      case 33: // page up
        if (event.ctrlKey || event.metaKey) {
          if (!event.repeat) {
            this.callbacks.onSendCommand(goUpCommand)
          }
          inputHandled = true
        }
        break

      case 99: // numpad page down in Safari and Firefox. Chrome returns keycode 51 + code 'Numpad3' instead.
        if (!event.repeat) {
          this.callbacks.onSendCommand(goDownCommand)
        }
        inputHandled = true
        break
      case 51: // '3'
        if (event.code == "Numpad3") {
          if (!event.repeat) {
            this.callbacks.onSendCommand(goDownCommand)
          }
          inputHandled = true
        }
        break
      case 34: // page down
        if (event.ctrlKey || event.metaKey) {
          if (!event.repeat) {
            this.callbacks.onSendCommand(goDownCommand)
          }
          inputHandled = true
        }
        break

      case 100: // numpad left arrow in Safari and Firefox. Chrome returns keyCode 52 + code 'Numpad4' instead.
        if (!event.repeat) {
          this.callbacks.onSendCommand(goWestCommand)
        }
        inputHandled = true
        break
      case 52: // '4'
        if (event.code == "Numpad4") {
          if (!event.repeat) {
            this.callbacks.onSendCommand(goWestCommand)
          }
          inputHandled = true
        }
        break
      case 37: // left arrow
        if (event.ctrlKey || event.metaKey) {
          if (!event.repeat) {
            this.callbacks.onSendCommand(goWestCommand)
          }
          inputHandled = true
        }
        break

      case 104: // numpad up arrow in Safari and Firefox. Chrome returns keycode 56 + code 'Numpad8' instead.
        if (!event.repeat) {
          this.callbacks.onSendCommand(goNorthCommand)
        }
        inputHandled = true
        break
      case 56: // '8'
        if (event.code == "Numpad8") {
          if (!event.repeat) {
            this.callbacks.onSendCommand(goNorthCommand)
          }
          inputHandled = true
        }
        break
      case 38: // up arrow
        if (event.ctrlKey || event.metaKey) {
          if (!event.repeat) {
            this.callbacks.onSendCommand(goNorthCommand)
          }
          inputHandled = true
        }
        break

      case 102: // numpad right arrow in Safari and Firefox. Chrome returns keycode 54 + code 'Numpad6' instead.
        if (!event.repeat) {
          this.callbacks.onSendCommand(goEastCommand)
        }
        inputHandled = true
        break
      case 54: // '6'
        if (event.code == "Numpad6") {
          if (!event.repeat) {
            this.callbacks.onSendCommand(goEastCommand)
          }
          inputHandled = true
        }
        break
      case 39: // right arrow
        if (event.ctrlKey || event.metaKey) {
          if (!event.repeat) {
            this.callbacks.onSendCommand(goEastCommand)
          }
          inputHandled = true
        }
        break

      case 98: // numpad down arrow in Safari and Firefox. Chrome returns keycode 50 + code 'Numpad2' instead.
        if (!event.repeat) {
          this.callbacks.onSendCommand(goSouthCommand)
        }
        inputHandled = true
        break
      case 50: // '2'
        if (event.code == "Numpad2") {
          if (!event.repeat) {
            this.callbacks.onSendCommand(goSouthCommand)
          }
          inputHandled = true
        }
        break
      case 40: // down arrow
        if (event.ctrlKey || event.metaKey) {
          if (!event.repeat) {
            this.callbacks.onSendCommand(goSouthCommand)
          }
          inputHandled = true
        }
        break

      default:
        break
    }
    return inputHandled
  }

  private debugLogKeyboardEvent = (event: KeyboardEvent) => {
    console.debug(
      "%s",
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      `target=${event.target}, ` +
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `currentTarget=${event.currentTarget}, ` +
        `defaultPrevented=${event.defaultPrevented}, ` +
        `key=${event.key}, ` +
        `code=${event.code}, ` +
        `charCode=${event.charCode}, ` +
        `keyCode=${event.keyCode}, ` +
        `which=${event.which}, ` +
        `location=${event.location}`,
    )
  }
}

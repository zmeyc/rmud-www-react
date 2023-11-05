export type HotkeyCallbacks = {
  onSendUserInput: () => void
  onFocusUserInput: () => void
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
      this.callbacks.onFocusUserInput?.()
    }
  }

  private handleKeydownWithKeycode = (event: KeyboardEvent) => {
    let inputHandled = false
    switch (event.keyCode) {
      case 13: // return
      case 14: // enter
        if (!event.shiftKey) {
          if (!event.repeat) {
            this.callbacks.onSendUserInput?.()
          }
          inputHandled = true
        }
        break
      case 27: // escape
        inputHandled = true
        break
      default:
        break
    }
    return inputHandled
  }

  private debugLogKeyboardEvent = (event: KeyboardEvent) => {
    console.debug(
      "%s",
      `target=${event.target}, ` +
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

import { ForwardedRef } from "preact/compat"
import { Ref, useImperativeHandle } from "preact/hooks"

export interface MaskedInputElement {
  focus: () => void
  isFocused: () => boolean
  clear: () => void
  value: () => string
  setValue: (value: string) => void
}

export function useMaskedInputElement(
  ref: ForwardedRef<MaskedInputElement>,
  inputRef: Ref<HTMLInputElement>,
) {
  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        inputRef.current?.focus()
      },
      isFocused: () => {
        const input = inputRef.current
        if (input === null) {
          return false
        }
        return document.activeElement === input
      },
      clear: () => {
        const input = inputRef.current
        if (input === null) {
          return
        }
        input.value = ""
      },
      value: () => {
        return inputRef.current?.value ?? ""
      },
      setValue: (value: string) => {
        const input = inputRef.current
        if (input === null) {
          return
        }
        input.value = value
      },
    }),
    [inputRef],
  )
}

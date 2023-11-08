import { ForwardedRef } from "preact/compat"
import { Ref, useImperativeHandle } from "preact/hooks"

export interface AutoGrowingTextAreaElement {
  focus: () => void
  isFocused: () => boolean
  clear: () => void
  value: () => string
  setValue: (value: string) => void
}

export function useAutoGrowingTextAreaElement(
  ref: ForwardedRef<AutoGrowingTextAreaElement>,
  textareaRef: Ref<HTMLTextAreaElement>,
  onDidChangeTextAreaSize?: () => void,
) {
  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        textareaRef.current?.focus()
      },
      isFocused: () => {
        const textarea = textareaRef.current
        if (textarea === null) {
          return false
        }
        return document.activeElement === textarea
      },
      clear: () => {
        const textarea = textareaRef.current
        if (textarea === null) {
          return
        }
        textarea.value = ""
        updateBackingParentSize(textarea)
        onDidChangeTextAreaSize?.()
      },
      value: () => {
        return textareaRef.current?.value ?? ""
      },
      setValue: (value: string) => {
        const textarea = textareaRef.current
        if (textarea === null) {
          return
        }
        textarea.value = value
        updateBackingParentSize(textarea)
        onDidChangeTextAreaSize?.()
      },
    }),
    [onDidChangeTextAreaSize, textareaRef],
  )
}

export function updateBackingParentSize(element: HTMLTextAreaElement) {
  const parentElement = element.parentElement
  if (parentElement == null) {
    return
  }
  parentElement.dataset.replicatedValue = element.value
}

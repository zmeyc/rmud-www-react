import { ForwardedRef } from "preact/compat"
import { Ref, useImperativeHandle } from "preact/hooks"

export interface AutoGrowingTextAreaElement {
  focus: () => void
  clear: () => void
  value: () => string
  setValue: (value: string) => void
}

export function useAutoGrowingTextAreaElement(
  ref: ForwardedRef<AutoGrowingTextAreaElement>,
  textareaRef: Ref<HTMLTextAreaElement>,
) {
  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        textareaRef.current?.focus()
      },
      clear: () => {
        let textarea = textareaRef.current
        if (textarea === null) {
          return
        }
        textarea.value = ""
        updateBackingParentSize(textarea)
      },
      value: () => {
        return textareaRef.current?.value ?? ""
      },
      setValue: (value: string) => {
        let textarea = textareaRef.current
        if (textarea === null) {
          return
        }
        textarea.value = value
        updateBackingParentSize(textarea)
      },
    }),
    [],
  )
}

export function updateBackingParentSize(element: HTMLTextAreaElement) {
  const parentElement = element.parentElement
  if (parentElement == null) {
    return
  }
  parentElement.dataset.replicatedValue = element.value
}

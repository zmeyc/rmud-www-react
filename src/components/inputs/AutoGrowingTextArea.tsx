import {
  ComponentProps,
  TargetedEvent,
  forwardRef,
  memo,
  useCallback,
  useRef,
} from "preact/compat"
import cn from "classnames"
import {
  AutoGrowingTextAreaElement,
  updateBackingParentSize,
  useAutoGrowingTextAreaElement,
} from "./AutoGrowingTextAreaElement"
import styles from "./AutoGrowingTextArea.module.css"

export interface AutoGrowingTextAreaProps extends ComponentProps<"div"> {
  className?: string
  placeholder?: string
  onDidChangeTextAreaSize?: () => void
}

export const AutoGrowingTextArea = memo(
  forwardRef<AutoGrowingTextAreaElement, AutoGrowingTextAreaProps>(
    ({ className, placeholder, onDidChangeTextAreaSize, ...props }, ref) => {
      const textareaRef = useRef<HTMLTextAreaElement>(null)

      useAutoGrowingTextAreaElement(ref, textareaRef)

      const handleInput = useCallback(
        (event: TargetedEvent<HTMLTextAreaElement>) => {
          const { currentTarget } = event
          updateBackingParentSize(currentTarget)
          onDidChangeTextAreaSize?.()
        },
        [onDidChangeTextAreaSize],
      )

      return (
        <div
          {...props}
          className={cn(styles.root, className)}
        >
          <textarea
            ref={textareaRef}
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            // @ts-expect-error Workaround https://github.com/preactjs/preact/issues/485#issuecomment-270287249
            spellCheck="false"
            rows={1}
            placeholder={placeholder}
            onInput={handleInput}
          />
        </div>
      )
    },
  ),
)
AutoGrowingTextArea.displayName = "AutoGrowingTextArea"

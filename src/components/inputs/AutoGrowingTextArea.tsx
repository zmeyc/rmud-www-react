import {
  ComponentProps,
  Ref,
  TargetedEvent,
  forwardRef,
  memo,
  useCallback,
  useRef,
} from "preact/compat"
import {
  AutoGrowingTextAreaElement,
  updateBackingParentSize,
  useAutoGrowingTextAreaElement,
} from "./AutoGrowingTextAreaElement"
import cn from "classnames"
import styles from "./AutoGrowingTextArea.module.css"

export interface AutoGrowingTextAreaProps extends ComponentProps<"div"> {
  className?: string
  placeholder?: string
  commandsRef?: Ref<AutoGrowingTextAreaElement>
}

export const AutoGrowingTextArea = memo(
  forwardRef<AutoGrowingTextAreaElement, AutoGrowingTextAreaProps>(
    ({ className, placeholder, commandsRef = null, ...props }, ref) => {
      const textareaRef = useRef<HTMLTextAreaElement>(null)

      useAutoGrowingTextAreaElement(ref, textareaRef)

      const handleInput = useCallback(
        (event: TargetedEvent<HTMLTextAreaElement, Event>) => {
          const { currentTarget } = event
          updateBackingParentSize(currentTarget)
        },
        [],
      )

      return (
        <div {...props} className={cn(styles.root, className)}>
          <textarea
            ref={textareaRef}
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            // @ts-ignore
            spellCheck="false"
            rows={1}
            placeholder={placeholder}
            onInput={handleInput}
          ></textarea>
        </div>
      )
    },
  ),
)
AutoGrowingTextArea.displayName = "AutoGrowingTextArea"

import { ComponentProps, forwardRef, memo, useRef } from "preact/compat"
import cn from "classnames"
import { MaskedInputElement, useMaskedInputElement } from "./MaskedInputElement"
import styles from "./MaskedInput.module.css"

export interface MaskedInputProps extends ComponentProps<"div"> {
  className?: string
  placeholder?: string
}

export const MaskedInput = memo(
  forwardRef<MaskedInputElement, MaskedInputProps>(
    ({ className, placeholder, ...props }, ref) => {
      const inputRef = useRef<HTMLInputElement>(null)

      useMaskedInputElement(ref, inputRef)

      return (
        <div
          {...props}
          className={cn(styles.root, className)}
        >
          <input
            ref={inputRef}
            type="password"
            placeholder={placeholder}
          />
        </div>
      )
    },
  ),
)
MaskedInput.displayName = "MaskedInput"

import {
  ComponentProps,
  forwardRef,
  memo,
  useCallback,
  useRef,
} from "preact/compat"
import cn from "classnames"
import { isScrolledToBottom } from "../../utils/html"
import { GameTextElement, useGameTextElement } from "./GameTextElement"
import styles from "./GameText.module.css"

export interface GameTextProps extends ComponentProps<"pre"> {
  className?: string
  onScrolledToBottomChange?: (isScrolledToBottom: boolean) => void
}

export const GameText = memo(
  forwardRef<GameTextElement, GameTextProps>(
    ({ className, onScrolledToBottomChange, ...props }, ref) => {
      const containerRef = useRef<HTMLDivElement | null>(null)
      const preRef = useRef<HTMLPreElement | null>(null)

      useGameTextElement(ref, containerRef, preRef)

      const handleScroll = useCallback(() => {
        const container = containerRef.current
        if (container === null) {
          return
        }

        onScrolledToBottomChange?.(isScrolledToBottom(container))
      }, [onScrolledToBottomChange])

      return (
        <div
          className={cn(styles.root, className)}
          ref={containerRef}
          onScroll={handleScroll}
        >
          <div className={styles.placeholder} />
          <pre
            {...props}
            className={styles.pre}
            ref={preRef}
          />
        </div>
      )
    },
  ),
)
GameText.displayName = "GameText"

import { ComponentProps, forwardRef, memo, useRef } from "preact/compat"
import cn from "classnames"
import { GameTextElement, useGameTextElement } from "./GameTextElement"
import styles from "./GameText.module.css"

export interface GameTextProps extends ComponentProps<"pre"> {
  className?: string
}

export const GameText = memo(
  forwardRef<GameTextElement, GameTextProps>(({ className, ...props }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const preRef = useRef<HTMLPreElement | null>(null)

    useGameTextElement(ref, containerRef, preRef)

    return (
      <div
        className={cn(styles.root, className)}
        ref={containerRef}
      >
        <div className={styles.placeholder} />
        <pre
          {...props}
          className={styles.pre}
          ref={preRef}
        />
      </div>
    )
  }),
)
GameText.displayName = "GameText"

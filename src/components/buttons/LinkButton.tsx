import { ComponentProps, FC, memo } from "preact/compat"
import cn from "classnames"
import styles from "./LinkButton.module.css"

export interface LinkButtonProps extends ComponentProps<"a"> {
  className?: string
  isActive?: boolean
}

export const LinkButton: FC<LinkButtonProps> = memo(
  ({ className, isActive = false, children, ...props }) => {
    const bracketsStyle = cn(styles.brackets, { [styles.active]: isActive })
    return (
      <a
        {...props}
        className={cn(styles.root, className, { [styles.active]: isActive })}
      >
        <span
          aria-hidden
          className={bracketsStyle}
        >
          [&nbsp;
        </span>
        {children}
        <span
          aria-hidden
          className={bracketsStyle}
        >
          &nbsp;]
        </span>
      </a>
    )
  },
)
LinkButton.displayName = "LinkButton"

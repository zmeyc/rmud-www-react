import { ComponentProps, FC, memo } from "preact/compat"
import cn from "classnames"
import styles from "./LinkButton.module.css"

export interface LinkButtonProps extends ComponentProps<"a"> {
  className?: string
  activeClassName?: string
}

export const LinkButton: FC<LinkButtonProps> = memo(
  ({ className, activeClassName = "active", children, ...props }) => {
    const bracketsStyle = cn(styles.brackets, activeClassName)
    return (
      <a {...props} className={cn(styles.root, className)}>
        <span className={bracketsStyle}>[</span>&nbsp;{children}&nbsp;
        <span className={bracketsStyle}>]</span>
      </a>
    )
  },
)
LinkButton.displayName = "LinkButton"

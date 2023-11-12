import { ComponentProps, FC, memo } from "preact/compat"
import cn from "classnames"
import styles from "./Footer.module.css"

export interface FooterProps extends ComponentProps<"div"> {
  className?: string
}

export const Footer: FC<FooterProps> = memo(({ className, ...props }) => {
  const currentYear = new Date().getFullYear()
  return (
    <footer
      {...props}
      role="contentinfo"
      className={cn(styles.root, className)}
    >
      &copy; 1997&nbsp;-&nbsp;{currentYear} <span lang="en">Team RMUD</span>
    </footer>
  )
})
Footer.displayName = "Footer"

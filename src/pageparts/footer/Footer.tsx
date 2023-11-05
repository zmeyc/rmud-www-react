import { ComponentProps, FC, memo } from "preact/compat"
import styles from "./Footer.module.css"

export interface FooterProps extends ComponentProps<"div"> {
  className?: string
}

export const Footer: FC<FooterProps> = memo(({ className, ...props }) => {
  const currentYear = new Date().getFullYear()
  return (
    <div {...props} className={styles.root}>
      &copy; 1997&nbsp;-&nbsp;{currentYear} Team RMUD
    </div>
  )
})
Footer.displayName = "Footer"

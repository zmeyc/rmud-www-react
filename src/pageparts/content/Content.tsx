import { ComponentProps, FC, memo } from "preact/compat"
import cn from "classnames"
import styles from "./Content.module.css"

export interface ContentProps extends ComponentProps<"div"> {
  className?: string
}

export const Content: FC<ContentProps> = memo(({ className, ...props }) => {
  return <div {...props} className={cn(className, styles.root)} />
})
Content.displayName = "Content"

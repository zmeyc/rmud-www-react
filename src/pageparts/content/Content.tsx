import { ComponentProps, FC } from "preact/compat"
import cn from "classnames"
import styles from "./Content.module.css"

export interface ContentProps extends ComponentProps<"div"> {
  className?: string
}

export const Content: FC<ContentProps> = ({ className, ...props }) => {
  return <div {...props} className={cn(className, styles.root)} />
}

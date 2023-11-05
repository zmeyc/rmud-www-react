import { ComponentProps, FC } from "preact/compat"
import cn from "classnames"
import styles from "./BarePage.module.css"

export interface BarePageProps extends ComponentProps<"div"> {
  className?: string
}

export const BarePage: FC<BarePageProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div {...props} className={cn(className, styles.root)}>
      {children}
    </div>
  )
}

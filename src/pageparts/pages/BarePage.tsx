import { ComponentProps, FC, forwardRef, memo } from "preact/compat"
import cn from "classnames"
import styles from "./BarePage.module.css"

export interface BarePageProps extends ComponentProps<"div"> {
  className?: string
}

export const BarePage: FC<BarePageProps> = memo(
  forwardRef<HTMLDivElement, BarePageProps>(
    ({ className, children, ...props }, ref) => {
      return (
        <div
          {...props}
          className={cn(className, styles.root)}
          ref={ref}
        >
          {children}
        </div>
      )
    },
  ),
)
BarePage.displayName = "BarePage"

import { ComponentProps, FC, memo } from "preact/compat"
import cn from "classnames"
import { GameLogo } from "../../components/logos/GameLogo"
import { HeaderTitle } from "./HeaderTitle"
import styles from "./Header.module.css"

export interface HeaderProps extends ComponentProps<"div"> {
  className?: string
}

export const Header: FC<HeaderProps> = memo(({ className, ...props }) => {
  return (
    <header
      {...props}
      role="banner"
      className={cn(className, styles.root)}
    >
      <GameLogo />
      <HeaderTitle />
    </header>
  )
})
Header.displayName = "Header"

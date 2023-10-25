import { ComponentProps, FC } from "preact/compat"
import cn from "classnames"
import { GameLogo } from "../../components/logos/GameLogo"
import { HeaderTitle } from "./HeaderTitle"
import styles from "./Header.module.css"

export interface HeaderProps extends ComponentProps<"div"> {
  className?: string
}

export const Header: FC<HeaderProps> = ({ className, ...props }) => {
  return (
    <div {...props} className={cn(className, styles.root)}>
      <GameLogo />
      <HeaderTitle />
    </div>
  )
}

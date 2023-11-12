import { ComponentProps, FC, memo } from "preact/compat"
import { getCurrentUrl } from "preact-router"
import cn from "classnames"
import { LinkButton } from "../../components/buttons/LinkButton"
import styles from "./TopMenu.module.css"

export interface TopMenuProps extends ComponentProps<"nav"> {
  className?: string
}

export const TopMenu: FC<TopMenuProps> = memo(({ className, ...props }) => {
  const url = getCurrentUrl()
  console.log(url)
  return (
    <nav
      {...props}
      className={cn(styles.root, className)}
    >
      <LinkButton
        href="/"
        isActive={url === "/"}
      >
        Новости
      </LinkButton>
      <LinkButton
        href="/links"
        isActive={url === "/links"}
      >
        Ссылки
      </LinkButton>
      <LinkButton
        href="/play"
        isActive={url === "/play"}
        target="_blank"
      >
        Играть
      </LinkButton>
    </nav>
  )
})
TopMenu.displayName = "TopMenu"

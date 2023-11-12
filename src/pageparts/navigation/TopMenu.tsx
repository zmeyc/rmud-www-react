import { ComponentProps, FC, memo } from "preact/compat"
import { getCurrentUrl } from "preact-router"
import cn from "classnames"
import { LinkButton } from "../../components/buttons/LinkButton"
import styles from "./TopMenu.module.css"

export interface TopMenuProps extends ComponentProps<"ul"> {
  className?: string
}

export const TopMenu: FC<TopMenuProps> = memo(({ className, ...props }) => {
  const url = getCurrentUrl()
  console.log(url)
  return (
    <ul
      {...props}
      className={cn(styles.root, className)}
    >
      <li>
        <LinkButton
          href="/"
          isActive={url === "/"}
        >
          Новости
        </LinkButton>
      </li>
      <li>
        <LinkButton
          href="/links"
          isActive={url === "/links"}
        >
          Ссылки
        </LinkButton>
      </li>
      <li>
        <LinkButton
          href="/play"
          isActive={url === "/play"}
          target="_blank"
        >
          Играть
        </LinkButton>
      </li>
    </ul>
  )
})
TopMenu.displayName = "TopMenu"

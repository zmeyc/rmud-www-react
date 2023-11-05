import { ComponentProps, FC, memo } from "preact/compat"
import cn from "classnames"
import styles from "./TopMenu.module.css"
import { LinkButton } from "../../components/buttons/LinkButton"

export interface TopMenuProps extends ComponentProps<"ul"> {
  className?: string
}

export const TopMenu: FC<TopMenuProps> = memo(({ className, ...props }) => {
  return (
    <ul {...props} className={cn(styles.root, className)}>
      <li>
        <LinkButton href="/">Новости</LinkButton>
      </li>
      <li>
        <LinkButton href="/about">Об игре</LinkButton>
      </li>
      <li>
        <LinkButton href="/links">Cсылки</LinkButton>
      </li>
      <li>
        <LinkButton href="/play" target="_blank">
          Играть
        </LinkButton>
      </li>
    </ul>
  )
})
TopMenu.displayName = "TopMenu"

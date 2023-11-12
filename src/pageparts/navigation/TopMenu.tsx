import { ComponentProps, FC, memo, useEffect, useRef } from "preact/compat"
import { getCurrentUrl } from "preact-router"
import cn from "classnames"
import { LinkButton } from "../../components/buttons/LinkButton"
import styles from "./TopMenu.module.css"

export interface TopMenuProps extends ComponentProps<"nav"> {
  className?: string
}

export const TopMenu: FC<TopMenuProps> = memo(({ className, ...props }) => {
  const rootRef = useRef<HTMLAnchorElement>(null)
  const linksRef = useRef<HTMLAnchorElement>(null)
  const playRef = useRef<HTMLAnchorElement>(null)

  const url = getCurrentUrl()

  useEffect(() => {
    if (url === "/") {
      rootRef.current?.focus()
    } else if (url === "/links") {
      linksRef.current?.focus()
    } else if (url === "/play") {
      playRef.current?.focus()
    }
  }, [url])

  return (
    <nav
      {...props}
      className={cn(styles.root, className)}
    >
      <LinkButton
        ref={rootRef}
        href="/"
        aria-current={url === "/"}
        isActive={url === "/"}
      >
        Новости
      </LinkButton>
      <LinkButton
        ref={linksRef}
        href="/links"
        aria-current={url === "/links"}
        isActive={url === "/links"}
      >
        Ссылки
      </LinkButton>
      <LinkButton
        ref={playRef}
        href="/play"
        aria-current={url === "/play"}
        isActive={url === "/play"}
        target="_blank"
      >
        Играть
      </LinkButton>
    </nav>
  )
})
TopMenu.displayName = "TopMenu"

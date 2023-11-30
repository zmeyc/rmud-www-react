import {
  ComponentProps,
  FC,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "preact/compat"
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

  const [isAutoFocused, setIsAutoFocused] = useState(true)

  const url = getCurrentUrl()

  const isRootActive = url === "/"
  const isLinksActive = url === "/links"
  const isPlayActive = url === "/play"

  useEffect(() => {
    if (isRootActive) {
      rootRef.current?.focus()
    } else if (isLinksActive) {
      linksRef.current?.focus()
    } else if (isPlayActive) {
      playRef.current?.focus()
    }
    setIsAutoFocused(true)
  }, [isLinksActive, isPlayActive, isRootActive])

  const handleBlur = useCallback(() => {
    setIsAutoFocused(false)
  }, [])

  return (
    <nav
      {...props}
      className={cn(styles.root, className)}
    >
      <LinkButton
        className={cn({ [styles.noOutline]: isAutoFocused })}
        ref={rootRef}
        href="/"
        aria-current={isRootActive}
        isActive={isRootActive}
        onBlur={handleBlur}
      >
        Новости
      </LinkButton>
      <LinkButton
        className={cn({ [styles.noOutline]: isAutoFocused })}
        ref={linksRef}
        href="/links"
        aria-current={isLinksActive}
        isActive={isLinksActive}
        onBlur={handleBlur}
      >
        Ссылки
      </LinkButton>
      <LinkButton
        className={cn({ [styles.noOutline]: isAutoFocused })}
        ref={playRef}
        href="/play"
        aria-current={isPlayActive}
        isActive={isPlayActive}
        target="_blank"
        onBlur={handleBlur}
      >
        Играть
      </LinkButton>
    </nav>
  )
})
TopMenu.displayName = "TopMenu"

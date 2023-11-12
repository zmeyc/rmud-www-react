import { ComponentProps, FC, memo } from "preact/compat"
import cn from "classnames"
import { Page } from "../pageparts/pages/Page"
import { useDocumentTitle } from "../hooks/useDocumentTitle"
import styles from "./LinksPage.module.css"

export interface LinksPageProps extends ComponentProps<"div"> {
  className?: string
}

export const LinksPage: FC<LinksPageProps> = memo(({ className, ...props }) => {
  useDocumentTitle("Ссылки")

  return (
    <Page
      {...props}
      className={cn(className, styles.root)}
    >
      <h1>Ресурсы, посвященные рмаду</h1>
      <h2>Чаты</h2>
      <p>
        <ul>
          <li>
            <a href="https://t.me/rmudchat">Чат в Телеграм</a>
          </li>
          <li>
            <a href="https://t.me/rmudchan">Дневник разработки в Telegram</a>
          </li>
        </ul>
      </p>
    </Page>
  )
})
LinksPage.displayName = "LinksPage"

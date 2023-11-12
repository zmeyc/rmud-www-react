import { ComponentProps, FC, memo } from "preact/compat"
import cn from "classnames"
import { Page } from "../pageparts/pages/Page"
import { LinkButton } from "../components/buttons/LinkButton"
import { useDocumentTitle } from "../hooks/useDocumentTitle"
import styles from "./HomePage.module.css"

export interface HomePageProps extends ComponentProps<"div"> {
  className?: string
}

export const HomePage: FC<HomePageProps> = memo(({ className, ...props }) => {
  useDocumentTitle("Новости")

  return (
    <Page
      {...props}
      className={cn(className, styles.root)}
    >
      <h1>Добро пожаловать в rmud!</h1>
      <p>
        RMUD &mdash; текстовая многопользовательская игра в жанре фэнтэзи,
        основанная в июне 1997 года. Изначально использовалась кодовая база{" "}
        <a
          target="_blank"
          rel="noreferrer"
          href="https://www.circlemud.org"
        >
          CircleMUD
        </a>
        , которая в течение многих лет разработки претерпела значительные
        изменения, а впоследствии была вовсе переписана с нуля на языке Swift.
      </p>
      <p>
        Исходный код игры находится <a href="https://github.com/rmud">здесь</a>.
      </p>
      <p>
        Изначально для игры нужен был MUD клиент, работающий по протоколу
        Telnet. Сейчас этот способ все еще поддерживается, но можно также играть
        прямо из браузера.
      </p>
      <p className={styles.play}>
        <LinkButton href="/play">Начать игру</LinkButton>
      </p>
      <h2>Последние новости</h2>
      <ul>
        <li>Открыт новый сайт игры с вебклиентом.</li>
      </ul>
    </Page>
  )
})
HomePage.displayName = "HomePage"

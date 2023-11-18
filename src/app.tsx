import { FC, memo } from "preact/compat"
import Router from "preact-router"
import { HomePage } from "./pages/HomePage"
import { AboutPage } from "./pages/AboutPage"
import { LinksPage } from "./pages/LinksPage"
import { PlayPage } from "./pages/PlayPage"
import styles from "./App.module.css"

export const App: FC = memo(() => {
  return (
    <div className={styles.root}>
      <Router>
        <HomePage
          className={styles.page}
          path="/"
        />
        <AboutPage
          className={styles.page}
          path="/about"
        />
        <LinksPage
          className={styles.page}
          path="/links"
        />
        <PlayPage
          className={styles.page}
          path="/play"
        />
      </Router>
    </div>
  )
})
App.displayName = "App"

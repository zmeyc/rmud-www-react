import { FC } from "preact/compat"
import { Page } from "./Page"
import styles from "./App.module.css"

export const App: FC = () => {
  return (
    <div className={styles.root}>
      <Page className={styles.page} />
    </div>
  )
}

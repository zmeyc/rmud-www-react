import { FC } from "preact/compat"
import styles from "./HeaderTitle.module.css"
import title from "../../assets/header-title.txt?raw"

export const HeaderTitle: FC = () => {
  return <pre className={styles.root}>{title}</pre>
}

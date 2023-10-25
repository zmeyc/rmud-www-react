import { FC } from "preact/compat"
import styles from "./TextPositioning.module.css"
import frame from "../../assets/sample-frame.txt?raw"
import content from "../../assets/sample-content.txt?raw"

export const TextPositioning: FC = () => {
  return (
    <div className={styles.root}>
      <pre className={styles.frame}>{frame}</pre>
      <pre className={styles.content}>{content}</pre>
    </div>
  )
}

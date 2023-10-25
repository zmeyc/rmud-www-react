import { FC } from "preact/compat"
import styles from "./GameLogo.module.css"
import logoCircle from "../../assets/logo-circle.txt?raw"
import logoDragon from "../../assets/logo-dragon.txt?raw"

export const GameLogo: FC = () => {
  return (
    <div className={styles.root}>
      <pre className={styles.circle}>{logoCircle}</pre>
      <pre className={styles.dragon}>{logoDragon}</pre>
    </div>
  )
}

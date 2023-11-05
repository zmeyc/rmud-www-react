import { FC, memo } from "preact/compat"
import logoCircle from "../../assets/logo-circle.txt?raw"
import logoDragon from "../../assets/logo-dragon.txt?raw"
import styles from "./GameLogo.module.css"

export const GameLogo: FC = memo(() => {
  return (
    <div className={styles.root}>
      <pre className={styles.circle}>{logoCircle}</pre>
      <pre className={styles.dragon}>{logoDragon}</pre>
    </div>
  )
})
GameLogo.displayName = "GameLogo"

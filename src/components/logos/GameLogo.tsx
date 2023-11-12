import { FC, memo } from "preact/compat"
import logoCircle from "../../assets/logo-circle.txt?raw"
import logoDragon from "../../assets/logo-dragon.txt?raw"
import styles from "./GameLogo.module.css"

export const GameLogo: FC = memo(() => {
  return (
    <figure
      role="img"
      aria-label="Логотип игры: дракон"
      className={styles.root}
    >
      <pre
        aria-hidden
        className={styles.circle}
      >
        {logoCircle}
      </pre>
      <pre
        aria-hidden
        className={styles.dragon}
      >
        {logoDragon}
      </pre>
    </figure>
  )
})
GameLogo.displayName = "GameLogo"

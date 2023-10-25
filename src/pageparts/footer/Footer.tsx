import { FC } from "preact/compat"
import { Moons } from "../../components/logos/Moons"
import styles from "./Footer.module.css"

export const Footer: FC = () => {
  const currentYear = new Date().getFullYear()
  return (
    <div className={styles.root}>&copy; 1997 - {currentYear} Team RMUD</div>
  )
}

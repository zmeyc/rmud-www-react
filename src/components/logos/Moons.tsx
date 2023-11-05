import { FC, memo } from "preact/compat"
import moons from "../../assets/moons.txt?raw"

export const Moons: FC = memo(() => {
  return <pre>{moons}</pre>
})
Moons.displayName = "Moons"

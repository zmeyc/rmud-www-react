import { FC } from "preact/compat"
import moons from "../../assets/moons.txt?raw"

export const Moons: FC = () => {
  return <pre>{moons}</pre>
}

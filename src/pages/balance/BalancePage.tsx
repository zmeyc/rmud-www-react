import {
  ComponentProps,
  FC,
  memo,
  useCallback,
  useMemo,
  useState,
} from "preact/compat"
import cn from "classnames"
import { Page } from "../../pageparts/pages/Page"
import { useDocumentTitle } from "../../hooks/useDocumentTitle"
import { DiceInput } from "./DiceInput"
import { Dice } from "./Dice"
import {
  calculateAttack,
  calculateDefense,
  didHitTarget,
  probability,
} from "./Fight"
import styles from "./BalancePage.module.css"

export interface BalancePageProps extends ComponentProps<"div"> {
  className?: string
}

export const BalancePage: FC<BalancePageProps> = memo(
  ({ className, ...props }) => {
    useDocumentTitle("Баланс")

    const [damage, setDamage] = useState(new Dice(1, 1, 0))

    const handleUpdateDamage = useCallback((dice: Dice) => {
      setDamage(dice)
    }, [])

    const attack = calculateAttack({})
    const defense = calculateDefense({})

    const hitProbability = useMemo(() => {
      return probability(() => {
        return didHitTarget(25, undefined)
      })
    }, [])

    return (
      <Page
        {...props}
        className={cn(className, styles.root)}
      >
        <p>Balance page</p>
        <fieldset>
          <legend>Damage</legend>
          <DiceInput
            dice={damage}
            onChangeDice={handleUpdateDamage}
          />
        </fieldset>
        <p>Average damage: {damage.averageRoll()}</p>
        <div className={styles.modifiers}>
          <div>
            <fieldset>
              <legend>Attack modifiers</legend>
            </fieldset>
            <p>Attack: {attack}</p>
          </div>
          <div>
            <fieldset>
              <legend>Attack modifiers</legend>
            </fieldset>
            <p>Attack: {attack}</p>
          </div>
          <div>
            <fieldset>
              <legend>Defense modifiers</legend>
            </fieldset>
            <p>Defense: {defense}</p>
          </div>
        </div>
        <p>Hit probability: {hitProbability}</p>
      </Page>
    )
  },
)
BalancePage.displayName = "BalancePage"

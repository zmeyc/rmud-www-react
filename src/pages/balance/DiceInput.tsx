import {
  ChangeEvent,
  ComponentProps,
  forwardRef,
  memo,
  useCallback,
} from "preact/compat"
import cn from "classnames"
import { Dice } from "./Dice"
import styles from "./DiceInput.module.css"

export interface DiceInputProps extends ComponentProps<"div"> {
  className?: string
  dice: Dice
  onChangeDice: (dice: Dice) => void
}

export const DiceInput = memo(
  forwardRef<HTMLDivElement, DiceInputProps>(
    ({ className, dice, onChangeDice, ...props }, ref) => {
      const handleChangeX = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
          const input = e.target as HTMLInputElement
          onChangeDice(new Dice(input.valueAsNumber, dice.y, dice.z))
        },
        [dice.y, dice.z, onChangeDice],
      )

      const handleChangeY = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
          const input = e.target as HTMLInputElement
          onChangeDice(new Dice(dice.x, input.valueAsNumber, dice.z))
        },
        [dice.x, dice.z, onChangeDice],
      )

      const handleChangeZ = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
          const input = e.target as HTMLInputElement
          onChangeDice(new Dice(dice.x, dice.y, input.valueAsNumber))
        },
        [dice.x, dice.y, onChangeDice],
      )

      return (
        <div
          {...props}
          ref={ref}
          className={cn(styles.root, className)}
        >
          <input
            type="number"
            value={dice.x}
            onChange={handleChangeX}
          />
          <span> d </span>
          <input
            type="number"
            value={dice.y}
            onChange={handleChangeY}
          />
          <span> + </span>
          <input
            type="number"
            value={dice.z}
            onChange={handleChangeZ}
          />
        </div>
      )
    },
  ),
)
DiceInput.displayName = "DiceInput"

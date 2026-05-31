import { ComponentProps, FC, memo, useCallback } from "preact/compat"
import cn from "classnames"
import {
  goDownCommand,
  goEastCommand,
  goNorthCommand,
  goSouthCommand,
  goUpCommand,
  goWestCommand,
  fleeCommand,
  lookCommand,
  retreatCommand,
} from "../webclient/MovementCommands"
import { MovementWidgetSettings } from "./types/WidgetTypes"
import styles from "./MovementWidget.module.css"

export interface MovementWidgetProps extends ComponentProps<"div"> {
  className?: string
  onSendCommand: (command: string) => void
  settings: MovementWidgetSettings
}

interface MovementButton {
  label: string
  command: string
  column: number
  isAdditionalCommand: boolean
  isSecondary: boolean
  row: number
}

const movementButtons: MovementButton[] = [
  {
    label: "убеж",
    command: fleeCommand,
    column: 1,
    isAdditionalCommand: true,
    isSecondary: true,
    row: 1,
  },
  {
    label: "север",
    command: goNorthCommand,
    column: 2,
    isAdditionalCommand: false,
    isSecondary: false,
    row: 1,
  },
  {
    label: "вверх",
    command: goUpCommand,
    column: 3,
    isAdditionalCommand: false,
    isSecondary: true,
    row: 1,
  },
  {
    label: "запад",
    command: goWestCommand,
    column: 1,
    isAdditionalCommand: false,
    isSecondary: false,
    row: 2,
  },
  {
    label: "см",
    command: lookCommand,
    column: 2,
    isAdditionalCommand: true,
    isSecondary: true,
    row: 2,
  },
  {
    label: "восток",
    command: goEastCommand,
    column: 3,
    isAdditionalCommand: false,
    isSecondary: false,
    row: 2,
  },
  {
    label: "юг",
    command: goSouthCommand,
    column: 2,
    isAdditionalCommand: false,
    isSecondary: false,
    row: 3,
  },
  {
    label: "отступ",
    command: retreatCommand,
    column: 1,
    isAdditionalCommand: true,
    isSecondary: true,
    row: 3,
  },
  {
    label: "вниз",
    command: goDownCommand,
    column: 3,
    isAdditionalCommand: false,
    isSecondary: true,
    row: 3,
  },
]

export const MovementWidget: FC<MovementWidgetProps> = memo(
  ({ className, onSendCommand, settings, ...props }) => {
    const handleClick = useCallback(
      (command: string) => {
        onSendCommand(command)
      },
      [onSendCommand],
    )

    return (
      <div
        {...props}
        className={cn(styles.root, className)}
      >
        {movementButtons
          .filter(
            (button) =>
              settings.showAdditionalCommands || !button.isAdditionalCommand,
          )
          .map((button) => (
            <button
              className={cn(styles.button, {
                [styles.secondaryButton]: button.isSecondary,
              })}
              key={button.command}
              style={{
                gridColumn: button.column,
                gridRow: button.row,
              }}
              title={button.command}
              type="button"
              onClick={() => {
                handleClick(button.command)
              }}
            >
              <span className={styles.label}>{button.label}</span>
            </button>
          ))}
      </div>
    )
  },
)
MovementWidget.displayName = "MovementWidget"

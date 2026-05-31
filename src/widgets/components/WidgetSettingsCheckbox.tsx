import {
  ComponentProps,
  FC,
  TargetedEvent,
  memo,
  useCallback,
} from "preact/compat"
import cn from "classnames"
import styles from "./WidgetSettingsDialog.module.css"

export interface WidgetSettingsCheckboxProps
  extends Omit<ComponentProps<"label">, "onChange"> {
  checked: boolean
  className?: string
  label: string
  onChange: (checked: boolean) => void
}

export const WidgetSettingsCheckbox: FC<WidgetSettingsCheckboxProps> = memo(
  ({ checked, className, label, onChange, ...props }) => {
    const handleChange = useCallback(
      (event: TargetedEvent<HTMLInputElement>) => {
        onChange(event.currentTarget.checked)
      },
      [onChange],
    )

    return (
      <label
        {...props}
        className={cn(styles.checkboxRow, className)}
      >
        <input
          checked={checked}
          className={styles.checkbox}
          type="checkbox"
          onChange={handleChange}
        />
        <span
          aria-hidden="true"
          className={styles.checkboxMark}
        >
          {checked ? "[x]" : "[ ]"}
        </span>
        <span className={styles.checkboxText}>{label}</span>
      </label>
    )
  },
)
WidgetSettingsCheckbox.displayName = "WidgetSettingsCheckbox"

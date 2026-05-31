import {
  ComponentProps,
  FC,
  TargetedEvent,
  memo,
  useCallback,
} from "preact/compat"
import cn from "classnames"
import styles from "./PlaySettingsDialog.module.css"

export interface PlaySettingsDialogProps extends ComponentProps<"div"> {
  className?: string
  isMirrorEnabled: boolean
  onClose: () => void
  onMirrorEnabledChange: (value: boolean) => void
}

export const PlaySettingsDialog: FC<PlaySettingsDialogProps> = memo(
  ({
    className,
    isMirrorEnabled,
    onClose,
    onMirrorEnabledChange,
    ...props
  }) => {
    const handleOverlayClick = useCallback(
      (event: TargetedEvent<HTMLDivElement, MouseEvent>) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      },
      [onClose],
    )

    const handleMirrorEnabledChange = useCallback(
      (event: TargetedEvent<HTMLInputElement>) => {
        onMirrorEnabledChange(event.currentTarget.checked)
      },
      [onMirrorEnabledChange],
    )

    return (
      <div
        {...props}
        className={cn(styles.overlay, className)}
        role="presentation"
        onClick={handleOverlayClick}
      >
        <section
          aria-modal="true"
          className={styles.dialog}
          role="dialog"
        >
          <header className={styles.titleBar}>
            <span>Настройки</span>
            <button
              aria-label="Закрыть"
              className={styles.titleButton}
              title="Закрыть"
              type="button"
              onClick={onClose}
            >
              [x]
            </button>
          </header>
          <div className={styles.body}>
            <label className={styles.checkboxRow}>
              <input
                checked={isMirrorEnabled}
                className={styles.checkbox}
                type="checkbox"
                onChange={handleMirrorEnabledChange}
              />
              <span
                aria-hidden="true"
                className={styles.checkboxMark}
              >
                {isMirrorEnabled ? "[x]" : "[ ]"}
              </span>
              <span className={styles.checkboxText}>
                Показывать новые события внизу, когда история прокручена вверх
              </span>
            </label>
          </div>
        </section>
      </div>
    )
  },
)
PlaySettingsDialog.displayName = "PlaySettingsDialog"

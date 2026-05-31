import {
  ComponentProps,
  FC,
  TargetedEvent,
  memo,
  useCallback,
} from "preact/compat"
import cn from "classnames"
import styles from "./WidgetSettingsDialog.module.css"

export interface WidgetSettingsDialogProps extends ComponentProps<"div"> {
  anchorRect: DOMRect
  className?: string
  heading: string
  onClose: () => void
}

function positionStyle(anchorRect: DOMRect) {
  const anchorGap = 8
  const isNearRightEdge = anchorRect.left > window.innerWidth / 2
  const isNearBottomEdge = anchorRect.top > window.innerHeight / 2

  return {
    ...(isNearRightEdge
      ? { right: `${window.innerWidth - anchorRect.right}px` }
      : { left: `${anchorRect.left}px` }),
    ...(isNearBottomEdge
      ? { bottom: `${window.innerHeight - anchorRect.top + anchorGap}px` }
      : { top: `${anchorRect.bottom + anchorGap}px` }),
  }
}

export const WidgetSettingsDialog: FC<WidgetSettingsDialogProps> = memo(
  ({
    anchorRect,
    children,
    className,
    heading,
    onClose,
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

    return (
      <div
        className={styles.overlay}
        role="presentation"
        onClick={handleOverlayClick}
      >
        <section
          {...props}
          aria-label={`Настройки: ${heading}`}
          className={cn(styles.dialog, className)}
          role="dialog"
          style={positionStyle(anchorRect)}
        >
          <header className={styles.titleBar}>
            <span>Настройки: {heading}</span>
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
          <div className={styles.body}>{children}</div>
        </section>
      </div>
    )
  },
)
WidgetSettingsDialog.displayName = "WidgetSettingsDialog"

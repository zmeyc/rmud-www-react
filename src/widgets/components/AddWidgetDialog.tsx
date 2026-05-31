import {
  ComponentProps,
  FC,
  TargetedEvent,
  memo,
  useCallback,
} from "preact/compat"
import cn from "classnames"
import { WidgetAddTarget, WidgetDefinition } from "../types/WidgetTypes"
import styles from "./AddWidgetDialog.module.css"

export interface AddWidgetDialogProps extends ComponentProps<"div"> {
  className?: string
  addTarget: WidgetAddTarget
  widgets: readonly WidgetDefinition[]
  onAddWidget: (widget: WidgetDefinition) => void
  onClose: () => void
}

function labelForTarget(target: WidgetAddTarget) {
  switch (target.lane) {
    case "panel-left-top":
      return "левая панель / верхний ряд"
    case "panel-left-bottom":
      return "левая панель / нижний ряд"
    case "panel-right-top":
      return "правая панель / верхний ряд"
    case "panel-right-bottom":
      return "правая панель / нижний ряд"
    case "game-top-left":
      return "игровая область / верх слева"
    case "game-top-right":
      return "игровая область / верх справа"
    case "game-bottom-right":
      return "игровая область / низ справа"
  }
}

export const AddWidgetDialog: FC<AddWidgetDialogProps> = memo(
  ({ addTarget, className, widgets, onAddWidget, onClose, ...props }) => {
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
            <span>Добавить виджет</span>
            <button
              aria-label="Закрыть"
              className={styles.titleButton}
              type="button"
              onClick={onClose}
            >
              [x]
            </button>
          </header>
          <div className={styles.body}>
            <div className={styles.target}>
              {labelForTarget(addTarget)}
            </div>
            <div className={styles.widgetList}>
              {widgets.map((widget) => (
                <button
                  className={styles.widgetButton}
                  key={widget.id}
                  type="button"
                  onClick={() => {
                    onAddWidget(widget)
                  }}
                >
                  [+] {widget.title()}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    )
  },
)
AddWidgetDialog.displayName = "AddWidgetDialog"

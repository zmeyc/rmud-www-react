import {
  ComponentProps,
  FC,
  TargetedEvent,
  memo,
  useCallback,
} from "preact/compat"
import cn from "classnames"
import { widgetDefinitions } from "../utils/WidgetRegistry"
import { WidgetAddTarget, WidgetType } from "../types/WidgetTypes"
import styles from "./AddWidgetDialog.module.css"

export interface AddWidgetDialogProps extends ComponentProps<"div"> {
  className?: string
  addTarget: WidgetAddTarget
  onAddWidget: (type: WidgetType) => void
  onClose: () => void
}

function labelForSide(target: WidgetAddTarget) {
  return target.side === "left" ? "левая панель" : "правая панель"
}

function labelForAlignment(target: WidgetAddTarget) {
  return target.alignment === "top" ? "верхний ряд" : "нижний ряд"
}

export const AddWidgetDialog: FC<AddWidgetDialogProps> = memo(
  ({ addTarget, className, onAddWidget, onClose, ...props }) => {
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
              {labelForSide(addTarget)} / {labelForAlignment(addTarget)}
            </div>
            <div className={styles.widgetList}>
              {widgetDefinitions.map((definition) => (
                <button
                  className={styles.widgetButton}
                  key={definition.type}
                  type="button"
                  onClick={() => {
                    onAddWidget(definition.type)
                  }}
                >
                  [+] {definition.title}
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

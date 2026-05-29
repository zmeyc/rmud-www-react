import {
  ComponentProps,
  FC,
  memo,
  useCallback,
  useEffect,
  useState,
} from "preact/compat"
import cn from "classnames"
import { AddWidgetDialog } from "./AddWidgetDialog"
import {
  InsertPosition,
  appendWidget,
  moveWidget,
} from "../utils/WidgetLayoutActions"
import {
  loadWidgetLayout,
  normalizeWidgetOrders,
  saveWidgetLayout,
} from "../utils/WidgetLayoutStorage"
import { WidgetPanel } from "./WidgetPanel"
import { WidgetAddTarget, WidgetType } from "../types/WidgetTypes"
import styles from "./WidgetLayout.module.css"

export interface WidgetLayoutProps extends ComponentProps<"div"> {
  className?: string
  onSendCommand: (command: string) => void
}

export const WidgetLayout: FC<WidgetLayoutProps> = memo(
  ({ className, children, onSendCommand, ...props }) => {
    const [widgets, setWidgets] = useState(loadWidgetLayout)
    const [addTarget, setAddTarget] = useState<WidgetAddTarget>()
    const [draggingWidgetId, setDraggingWidgetId] = useState<string>()

    useEffect(() => {
      saveWidgetLayout(widgets)
    }, [widgets])

    const handleAddWidget = useCallback(
      (type: WidgetType) => {
        if (addTarget === undefined) {
          return
        }

        setWidgets((currentWidgets) =>
          appendWidget(currentWidgets, type, addTarget),
        )
        setAddTarget(undefined)
      },
      [addTarget],
    )

    const handleDropWidget = useCallback(
      (
        widgetId: string,
        target: WidgetAddTarget,
        targetWidgetId?: string,
        position?: InsertPosition,
      ) => {
        setWidgets((currentWidgets) =>
          moveWidget(currentWidgets, widgetId, target, targetWidgetId, position),
        )
      },
      [],
    )

    const handleRemoveWidget = useCallback((widgetId: string) => {
      setWidgets((currentWidgets) =>
        normalizeWidgetOrders(
          currentWidgets.filter((widget) => widget.id !== widgetId),
        ),
      )
    }, [])

    const handleToggleWidgetMinimized = useCallback((widgetId: string) => {
      setWidgets((currentWidgets) =>
        currentWidgets.map((widget) =>
          widget.id === widgetId
            ? { ...widget, isMinimized: !widget.isMinimized }
            : widget,
        ),
      )
    }, [])

    const handleDragEnd = useCallback(() => {
      setDraggingWidgetId(undefined)
    }, [])

    const handleCloseAddDialog = useCallback(() => {
      setAddTarget(undefined)
    }, [])

    const panelProps = {
      draggingWidgetId,
      widgets,
      onAddClick: setAddTarget,
      onDragEnd: handleDragEnd,
      onDragStart: setDraggingWidgetId,
      onDropWidget: handleDropWidget,
      onRemoveWidget: handleRemoveWidget,
      onSendCommand,
      onToggleWidgetMinimized: handleToggleWidgetMinimized,
    }

    return (
      <div
        {...props}
        className={cn(styles.root, className)}
      >
        <WidgetPanel
          {...panelProps}
          side="left"
        />
        {children}
        <WidgetPanel
          {...panelProps}
          side="right"
        />
        {addTarget === undefined ? null : (
          <AddWidgetDialog
            addTarget={addTarget}
            onAddWidget={handleAddWidget}
            onClose={handleCloseAddDialog}
          />
        )}
      </div>
    )
  },
)
WidgetLayout.displayName = "WidgetLayout"

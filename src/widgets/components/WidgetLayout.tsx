import {
  ComponentProps,
  FC,
  memo,
  useCallback,
  useEffect,
  useRef,
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
import { WidgetLane, WidgetPanel } from "./WidgetPanel"
import {
  DefaultWidgetDefinition,
  WidgetAddTarget,
  WidgetDefinition,
  WidgetInstance,
  WidgetLaneId,
} from "../types/WidgetTypes"
import { useIsElementNarrowerThanCharacters } from "../../hooks/useIsElementNarrowerThanCharacters"
import styles from "./WidgetLayout.module.css"

export interface WidgetLayoutProps extends ComponentProps<"div"> {
  availableWidgets: readonly WidgetDefinition[]
  className?: string
  defaultWidgets: readonly DefaultWidgetDefinition[]
  onSendCommand: (command: string) => void
}

export const WidgetLayout: FC<WidgetLayoutProps> = memo(
  ({
    availableWidgets,
    className,
    children,
    defaultWidgets,
    onSendCommand,
    ...props
  }) => {
    const contentAreaRef = useRef<HTMLElement>(null)
    const [widgets, setWidgets] = useState(() =>
      loadWidgetLayout({
        availableWidgets,
        defaultWidgets,
      }),
    )
    const [addTarget, setAddTarget] = useState<WidgetAddTarget>()
    const [draggingWidgetId, setDraggingWidgetId] = useState<string>()
    const [innerDropTargetLane, setInnerDropTargetLane] =
      useState<WidgetLaneId>()
    const isNarrowContentArea = useIsElementNarrowerThanCharacters(
      contentAreaRef,
      110,
    )

    useEffect(() => {
      saveWidgetLayout(widgets)
    }, [widgets])

    useEffect(() => {
      if (draggingWidgetId === undefined) {
        setInnerDropTargetLane(undefined)
      }
    }, [draggingWidgetId])

    const handleAddWidget = useCallback(
      (widget: WidgetDefinition) => {
        if (addTarget === undefined) {
          return
        }

        setWidgets((currentWidgets) =>
          appendWidget(currentWidgets, widget, addTarget),
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

    const handleChangeWidget = useCallback(
      (changedWidget: WidgetInstance) => {
        setWidgets((currentWidgets) =>
          currentWidgets.map((widget) =>
            widget.id === changedWidget.id ? changedWidget : widget,
          ),
        )
      },
      [],
    )

    const handleToggleWidgetMinimized = useCallback((widgetId: string) => {
      setWidgets((currentWidgets) =>
        currentWidgets.map((widget) =>
          widget.id === widgetId
            ? widget.withMinimized(!widget.isMinimized)
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
      onChangeWidget: handleChangeWidget,
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
        <main
          className={cn(styles.contentArea, {
            [styles.narrowContentArea]: isNarrowContentArea,
          })}
          ref={contentAreaRef}
        >
          {children}
          <WidgetLane
            {...panelProps}
            className={cn(styles.innerLane, styles.innerTopLeftLane)}
            isDropTarget={innerDropTargetLane === "game-top-left"}
            lane="game-top-left"
            onDropTargetChange={setInnerDropTargetLane}
          />
          <WidgetLane
            {...panelProps}
            className={cn(styles.innerLane, styles.innerTopRightLane)}
            isDropTarget={innerDropTargetLane === "game-top-right"}
            lane="game-top-right"
            onDropTargetChange={setInnerDropTargetLane}
          />
          <WidgetLane
            {...panelProps}
            className={cn(styles.innerLane, styles.innerBottomRightLane)}
            isDropTarget={innerDropTargetLane === "game-bottom-right"}
            lane="game-bottom-right"
            onDropTargetChange={setInnerDropTargetLane}
          />
        </main>
        <WidgetPanel
          {...panelProps}
          side="right"
        />
        {addTarget === undefined ? null : (
          <AddWidgetDialog
            addTarget={addTarget}
            widgets={availableWidgets}
            onAddWidget={handleAddWidget}
            onClose={handleCloseAddDialog}
          />
        )}
      </div>
    )
  },
)
WidgetLayout.displayName = "WidgetLayout"

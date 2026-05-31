import {
  FC,
  TargetedEvent,
  memo,
  useCallback,
  useEffect,
  useState,
} from "preact/compat"
import cn from "classnames"
import { DateTimeWidget } from "../DateTimeWidget"
import { MovementWidget } from "../MovementWidget"
import { titleForWidgetType } from "../utils/WidgetRegistry"
import { widgetsForLane } from "../utils/WidgetLayoutStorage"
import { InsertPosition } from "../utils/WidgetLayoutActions"
import {
  WidgetAddTarget,
  WidgetAlignment,
  WidgetInstance,
  WidgetSide,
} from "../types/WidgetTypes"
import styles from "./WidgetLayout.module.css"

export interface WidgetPanelProps {
  side: WidgetSide
  widgets: WidgetInstance[]
  draggingWidgetId?: string
  onAddClick: (target: WidgetAddTarget) => void
  onDragEnd: () => void
  onDragStart: (widgetId: string) => void
  onDropWidget: (
    widgetId: string,
    target: WidgetAddTarget,
    targetWidgetId?: string,
    position?: InsertPosition,
  ) => void
  onRemoveWidget: (widgetId: string) => void
  onSendCommand: (command: string) => void
  onToggleWidgetMinimized: (widgetId: string) => void
}

interface WidgetLaneProps extends WidgetPanelProps {
  alignment: WidgetAlignment
  isDropTarget: boolean
  onDropTargetChange: (alignment?: WidgetAlignment) => void
}

interface WidgetCardProps {
  side: WidgetSide
  widget: WidgetInstance
  draggingWidgetId?: string
  onDragEnd: () => void
  onDragStart: (widgetId: string) => void
  onDropWidget: (
    widgetId: string,
    target: WidgetAddTarget,
    targetWidgetId?: string,
    position?: InsertPosition,
  ) => void
  onRemoveWidget: (widgetId: string) => void
  onSendCommand: (command: string) => void
  onToggleWidgetMinimized: (widgetId: string) => void
}

const dragDataType = "application/x-rmud-widget-id"

type TargetedDragEvent<T extends HTMLElement> = TargetedEvent<T, DragEvent>

function readDraggedWidgetId<T extends HTMLElement>(event: TargetedDragEvent<T>) {
  const { dataTransfer } = event
  if (dataTransfer === null) {
    return ""
  }

  return (
    dataTransfer.getData(dragDataType) || dataTransfer.getData("text/plain")
  )
}

function isMobileWidgetLayout() {
  return window.matchMedia("(max-width: 860px)").matches
}

function insertPositionForDrop(
  event: TargetedDragEvent<HTMLElement>,
  side: WidgetSide,
): InsertPosition {
  const { left, width } = event.currentTarget.getBoundingClientRect()
  const isBeforeInScreenOrder = event.clientX < left + width / 2
  if (isMobileWidgetLayout() || side === "right") {
    return isBeforeInScreenOrder ? "before" : "after"
  }
  return isBeforeInScreenOrder ? "after" : "before"
}

function renderWidgetContent(
  widget: WidgetInstance,
  onSendCommand: (command: string) => void,
) {
  switch (widget.type) {
    case "datetime":
      return <DateTimeWidget />
    case "movement":
      return <MovementWidget onSendCommand={onSendCommand} />
  }
}

const WidgetCard: FC<WidgetCardProps> = memo(
  ({
    draggingWidgetId,
    onDragEnd,
    onDragStart,
    onDropWidget,
    onRemoveWidget,
    onSendCommand,
    onToggleWidgetMinimized,
    side,
    widget,
  }) => {
    const handleDragStart = useCallback(
      (event: TargetedDragEvent<HTMLElement>) => {
        const { dataTransfer } = event
        if (dataTransfer === null) {
          return
        }

        dataTransfer.effectAllowed = "move"
        dataTransfer.setData(dragDataType, widget.id)
        dataTransfer.setData("text/plain", widget.id)
        onDragStart(widget.id)
      },
      [onDragStart, widget.id],
    )

    const handleDragOver = useCallback(
      (event: TargetedDragEvent<HTMLElement>) => {
        event.preventDefault()
        if (event.dataTransfer !== null) {
          event.dataTransfer.dropEffect = "move"
        }
      },
      [],
    )

    const handleDrop = useCallback(
      (event: TargetedDragEvent<HTMLElement>) => {
        event.preventDefault()
        event.stopPropagation()

        const draggedWidgetId = readDraggedWidgetId(event)
        if (draggedWidgetId.length === 0 || draggedWidgetId === widget.id) {
          return
        }

        onDropWidget(
          draggedWidgetId,
          {
            side: widget.side,
            alignment: widget.alignment,
          },
          widget.id,
          insertPositionForDrop(event, side),
        )
      },
      [onDropWidget, side, widget.alignment, widget.id, widget.side],
    )

    const minimizeControl = widget.isMinimized ? "[=]" : "[_]"
    const minimizeTitle = widget.isMinimized ? "Развернуть" : "Свернуть"
    const title = titleForWidgetType(widget.type)

    return (
      <article
        className={cn(styles.widget, {
          [styles.dragging]: draggingWidgetId === widget.id,
        })}
        draggable
        onDragEnd={onDragEnd}
        onDragOver={handleDragOver}
        onDragStart={handleDragStart}
        onDrop={handleDrop}
      >
        <header className={styles.widgetTitleBar}>
          <span className={styles.dragHandle}>:::</span>
          <span className={styles.widgetTitle}>{title}</span>
          <button
            aria-label={`${minimizeTitle} виджет`}
            className={styles.widgetTitleButton}
            title={minimizeTitle}
            type="button"
            onClick={() => {
              onToggleWidgetMinimized(widget.id)
            }}
          >
            {minimizeControl}
          </button>
          <button
            aria-label="Удалить виджет"
            className={styles.widgetTitleButton}
            title="Удалить"
            type="button"
            onClick={() => {
              onRemoveWidget(widget.id)
            }}
          >
            [x]
          </button>
        </header>
        {widget.isMinimized ? null : (
          <div className={styles.widgetBody}>
            {renderWidgetContent(widget, onSendCommand)}
          </div>
        )}
      </article>
    )
  },
)
WidgetCard.displayName = "WidgetCard"

const WidgetLane: FC<WidgetLaneProps> = memo(
  ({
    alignment,
    draggingWidgetId,
    isDropTarget,
    onAddClick,
    onDragEnd,
    onDragStart,
    onDropTargetChange,
    onDropWidget,
    onRemoveWidget,
    onSendCommand,
    onToggleWidgetMinimized,
    side,
    widgets,
  }) => {
    const laneWidgets = widgetsForLane(widgets, side, alignment)

    const handleDragOver = useCallback(
      (event: TargetedDragEvent<HTMLDivElement>) => {
        event.preventDefault()
        onDropTargetChange(alignment)
        if (event.dataTransfer !== null) {
          event.dataTransfer.dropEffect = "move"
        }
      },
      [alignment, onDropTargetChange],
    )

    const handleDragLeave = useCallback(
      (event: TargetedDragEvent<HTMLDivElement>) => {
        const relatedTarget = event.relatedTarget
        if (
          relatedTarget instanceof Node &&
          event.currentTarget.contains(relatedTarget)
        ) {
          return
        }

        onDropTargetChange(undefined)
      },
      [onDropTargetChange],
    )

    const handleDrop = useCallback(
      (event: TargetedDragEvent<HTMLDivElement>) => {
        event.preventDefault()
        onDropTargetChange(undefined)

        const draggedWidgetId = readDraggedWidgetId(event)
        if (draggedWidgetId.length === 0) {
          return
        }

        onDropWidget(draggedWidgetId, { side, alignment })
      },
      [alignment, onDropTargetChange, onDropWidget, side],
    )

    const handleAddDragOver = useCallback(
      (event: TargetedDragEvent<HTMLButtonElement>) => {
        event.preventDefault()
        onDropTargetChange(alignment)
        if (event.dataTransfer !== null) {
          event.dataTransfer.dropEffect = "move"
        }
      },
      [alignment, onDropTargetChange],
    )

    const handleAddDrop = useCallback(
      (event: TargetedDragEvent<HTMLButtonElement>) => {
        event.preventDefault()
        event.stopPropagation()
        onDropTargetChange(undefined)

        const draggedWidgetId = readDraggedWidgetId(event)
        if (draggedWidgetId.length === 0) {
          return
        }

        onDropWidget(draggedWidgetId, { side, alignment })
      },
      [alignment, onDropTargetChange, onDropWidget, side],
    )

    return (
      <div
        className={cn(styles.lane, {
          [styles.topLane]: alignment === "top",
          [styles.bottomLane]: alignment === "bottom",
          [styles.dropTarget]:
            draggingWidgetId !== undefined && isDropTarget,
        })}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {laneWidgets.map((widget) => (
          <WidgetCard
            draggingWidgetId={draggingWidgetId}
            key={widget.id}
            side={side}
            widget={widget}
            onDragEnd={onDragEnd}
            onDragStart={onDragStart}
            onDropWidget={onDropWidget}
            onRemoveWidget={onRemoveWidget}
            onSendCommand={onSendCommand}
            onToggleWidgetMinimized={onToggleWidgetMinimized}
          />
        ))}
        <button
          aria-label="Добавить виджет"
          className={styles.addButton}
          title="Добавить виджет"
          type="button"
          onClick={() => {
            onAddClick({ side, alignment })
          }}
          onDragOver={handleAddDragOver}
          onDrop={handleAddDrop}
        >
          [+]
        </button>
      </div>
    )
  },
)
WidgetLane.displayName = "WidgetLane"

export const WidgetPanel: FC<WidgetPanelProps> = memo(
  ({ side, ...props }) => {
    const [dropTargetAlignment, setDropTargetAlignment] =
      useState<WidgetAlignment>()

    useEffect(() => {
      if (props.draggingWidgetId === undefined) {
        setDropTargetAlignment(undefined)
      }
    }, [props.draggingWidgetId])

    return (
      <aside
        className={cn(styles.panel, {
          [styles.leftPanel]: side === "left",
          [styles.rightPanel]: side === "right",
        })}
      >
        <WidgetLane
          {...props}
          alignment="top"
          isDropTarget={dropTargetAlignment === "top"}
          onDropTargetChange={setDropTargetAlignment}
          side={side}
        />
        <WidgetLane
          {...props}
          alignment="bottom"
          isDropTarget={dropTargetAlignment === "bottom"}
          onDropTargetChange={setDropTargetAlignment}
          side={side}
        />
      </aside>
    )
  },
)
WidgetPanel.displayName = "WidgetPanel"

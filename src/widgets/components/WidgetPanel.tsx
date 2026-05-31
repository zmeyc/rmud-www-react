import {
  FC,
  Fragment,
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
  widget: WidgetInstance
  draggingWidgetId?: string
  onInsertionTargetChange: (target?: WidgetInsertionTarget) => void
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

interface WidgetInsertionTarget {
  targetWidgetId?: string
  position: InsertPosition
}

function insertionTargetsAreEqual(
  first?: WidgetInsertionTarget,
  second?: WidgetInsertionTarget,
) {
  return (
    first?.targetWidgetId === second?.targetWidgetId &&
    first?.position === second?.position
  )
}

const dragDataType = "application/x-rmud-widget-id"

const compactWidgetTypes: Record<WidgetInstance["type"], boolean> = {
  datetime: true,
  movement: true,
}

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

function insertPositionForDrop(event: TargetedDragEvent<HTMLElement>) {
  const lane = event.currentTarget.parentElement
  const flexDirection =
    lane === null ? "row" : window.getComputedStyle(lane).flexDirection
  const isColumnDirection = flexDirection.startsWith("column")
  const isReverseDirection = flexDirection.endsWith("reverse")
  const { height, left, top, width } =
    event.currentTarget.getBoundingClientRect()
  const isBeforeInScreenOrder = isColumnDirection
    ? event.clientY < top + height / 2
    : event.clientX < left + width / 2
  const isBeforeInSourceOrder = isReverseDirection
    ? !isBeforeInScreenOrder
    : isBeforeInScreenOrder

  return isBeforeInSourceOrder ? "before" : "after"
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
    onInsertionTargetChange,
    onDropWidget,
    onRemoveWidget,
    onSendCommand,
    onToggleWidgetMinimized,
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

        if (draggingWidgetId === undefined || draggingWidgetId === widget.id) {
          onInsertionTargetChange(undefined)
          return
        }

        onInsertionTargetChange({
          targetWidgetId: widget.id,
          position: insertPositionForDrop(event),
        })

        if (event.dataTransfer !== null) {
          event.dataTransfer.dropEffect = "move"
        }
      },
      [draggingWidgetId, onInsertionTargetChange, widget.id],
    )

    const handleDrop = useCallback(
      (event: TargetedDragEvent<HTMLElement>) => {
        event.preventDefault()
        event.stopPropagation()
        onInsertionTargetChange(undefined)

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
          insertPositionForDrop(event),
        )
      },
      [
        onDropWidget,
        onInsertionTargetChange,
        widget.alignment,
        widget.id,
        widget.side,
      ],
    )

    const minimizeControl = widget.isMinimized ? "[=]" : "[_]"
    const minimizeTitle = widget.isMinimized ? "Развернуть" : "Свернуть"
    const title = titleForWidgetType(widget.type)

    return (
      <article
        className={cn(styles.widget, {
          [styles.compactWidget]: compactWidgetTypes[widget.type],
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
    const [insertionTarget, setInsertionTarget] =
      useState<WidgetInsertionTarget>()
    const updateInsertionTarget = useCallback(
      (target?: WidgetInsertionTarget) => {
        setInsertionTarget((currentTarget) =>
          insertionTargetsAreEqual(currentTarget, target)
            ? currentTarget
            : target,
        )
      },
      [],
    )
    const showInsertionMarker =
      draggingWidgetId !== undefined &&
      isDropTarget &&
      insertionTarget !== undefined

    useEffect(() => {
      if (draggingWidgetId === undefined || !isDropTarget) {
        updateInsertionTarget(undefined)
      }
    }, [draggingWidgetId, isDropTarget, updateInsertionTarget])

    const handleDragOver = useCallback(
      (event: TargetedDragEvent<HTMLDivElement>) => {
        event.preventDefault()
        onDropTargetChange(alignment)
        if (event.target === event.currentTarget) {
          updateInsertionTarget(undefined)
        }

        if (event.dataTransfer !== null) {
          event.dataTransfer.dropEffect = "move"
        }
      },
      [alignment, onDropTargetChange, updateInsertionTarget],
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
        updateInsertionTarget(undefined)
      },
      [onDropTargetChange, updateInsertionTarget],
    )

    const handleDrop = useCallback(
      (event: TargetedDragEvent<HTMLDivElement>) => {
        event.preventDefault()
        onDropTargetChange(undefined)
        updateInsertionTarget(undefined)

        const draggedWidgetId = readDraggedWidgetId(event)
        if (draggedWidgetId.length === 0) {
          return
        }

        onDropWidget(draggedWidgetId, { side, alignment })
      },
      [
        alignment,
        onDropTargetChange,
        onDropWidget,
        side,
        updateInsertionTarget,
      ],
    )

    const handleAddDragOver = useCallback(
      (event: TargetedDragEvent<HTMLButtonElement>) => {
        event.preventDefault()
        onDropTargetChange(alignment)
        updateInsertionTarget(undefined)
        if (event.dataTransfer !== null) {
          event.dataTransfer.dropEffect = "move"
        }
      },
      [alignment, onDropTargetChange, updateInsertionTarget],
    )

    const handleAddDrop = useCallback(
      (event: TargetedDragEvent<HTMLButtonElement>) => {
        event.preventDefault()
        event.stopPropagation()
        onDropTargetChange(undefined)
        updateInsertionTarget(undefined)

        const draggedWidgetId = readDraggedWidgetId(event)
        if (draggedWidgetId.length === 0) {
          return
        }

        onDropWidget(draggedWidgetId, { side, alignment })
      },
      [
        alignment,
        onDropTargetChange,
        onDropWidget,
        side,
        updateInsertionTarget,
      ],
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
        {laneWidgets.map((widget) => {
          const isInsertionTarget =
            showInsertionMarker && insertionTarget.targetWidgetId === widget.id

          return (
            <Fragment key={widget.id}>
              {isInsertionTarget &&
              insertionTarget.position === "before" ? (
                <div
                  aria-hidden="true"
                  className={styles.insertionMarker}
                />
              ) : null}
              <WidgetCard
                draggingWidgetId={draggingWidgetId}
                widget={widget}
                onDragEnd={onDragEnd}
                onDragStart={onDragStart}
                onDropWidget={onDropWidget}
                onInsertionTargetChange={updateInsertionTarget}
                onRemoveWidget={onRemoveWidget}
                onSendCommand={onSendCommand}
                onToggleWidgetMinimized={onToggleWidgetMinimized}
              />
              {isInsertionTarget && insertionTarget.position === "after" ? (
                <div
                  aria-hidden="true"
                  className={styles.insertionMarker}
                />
              ) : null}
            </Fragment>
          )
        })}
        {showInsertionMarker &&
        insertionTarget.targetWidgetId === undefined ? (
          <div
            aria-hidden="true"
            className={styles.insertionMarker}
          />
        ) : null}
        {draggingWidgetId === undefined ? (
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
        ) : null}
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

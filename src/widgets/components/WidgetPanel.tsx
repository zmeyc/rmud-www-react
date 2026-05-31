import {
  FC,
  Fragment,
  TargetedEvent,
  memo,
  useCallback,
  useEffect,
  useMemo,
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
  WidgetInstance,
  WidgetLaneId,
  WidgetSide,
} from "../types/WidgetTypes"
import styles from "./WidgetLayout.module.css"

interface WidgetLaneCommonProps {
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

export interface WidgetPanelProps extends WidgetLaneCommonProps {
  side: WidgetSide
}

interface WidgetLaneProps extends WidgetLaneCommonProps {
  className?: string
  isDropTarget: boolean
  lane: WidgetLaneId
  onDropTargetChange: (lane?: WidgetLaneId) => void
  showAddButton?: boolean
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

function normalizeInsertionTarget(
  target: WidgetInsertionTarget | undefined,
  laneWidgets: WidgetInstance[],
  draggingWidgetId?: string,
): WidgetInsertionTarget | undefined {
  if (target === undefined) {
    return undefined
  }

  const targetableWidgets = laneWidgets.filter(
    (widget) => widget.id !== draggingWidgetId,
  )
  const draggedWidgetIndex = laneWidgets.findIndex(
    (widget) => widget.id === draggingWidgetId,
  )
  const isSameLaneDrag = draggedWidgetIndex !== -1

  if (targetableWidgets.length === 0) {
    if (isSameLaneDrag) {
      return undefined
    }

    return target.targetWidgetId === undefined ? target : undefined
  }

  if (target.targetWidgetId === undefined) {
    if (isSameLaneDrag && draggedWidgetIndex === targetableWidgets.length) {
      return undefined
    }

    return {
      targetWidgetId: targetableWidgets[targetableWidgets.length - 1].id,
      position: "after",
    }
  }

  const targetIndex = targetableWidgets.findIndex(
    (widget) => widget.id === target.targetWidgetId,
  )

  if (targetIndex === -1) {
    return undefined
  }

  const insertAt = targetIndex + (target.position === "after" ? 1 : 0)
  if (isSameLaneDrag && insertAt === draggedWidgetIndex) {
    return undefined
  }

  if (insertAt >= targetableWidgets.length) {
    return {
      targetWidgetId: targetableWidgets[targetableWidgets.length - 1].id,
      position: "after",
    }
  }

  return {
    targetWidgetId: targetableWidgets[insertAt].id,
    position: "before",
  }
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

function insertPositionForElementDrop(
  lane: Element | null,
  element: HTMLElement,
  clientX: number,
  clientY: number,
) {
  const flexDirection =
    lane === null ? "row" : window.getComputedStyle(lane).flexDirection
  const isColumnDirection = flexDirection.startsWith("column")
  const isReverseDirection = flexDirection.endsWith("reverse")
  const { height, left, top, width } = element.getBoundingClientRect()
  const isBeforeInScreenOrder = isColumnDirection
    ? clientY < top + height / 2
    : clientX < left + width / 2
  const isBeforeInSourceOrder = isReverseDirection
    ? !isBeforeInScreenOrder
    : isBeforeInScreenOrder

  return isBeforeInSourceOrder ? "before" : "after"
}

function insertPositionForDrop(event: TargetedDragEvent<HTMLElement>) {
  return insertPositionForElementDrop(
    event.currentTarget.parentElement,
    event.currentTarget,
    event.clientX,
    event.clientY,
  )
}

function distanceFromPointToRect(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  isColumnDirection: boolean,
) {
  const distanceX =
    clientX < rect.left
      ? rect.left - clientX
      : Math.max(clientX - rect.right, 0)
  const distanceY =
    clientY < rect.top
      ? rect.top - clientY
      : Math.max(clientY - rect.bottom, 0)
  const primaryDistance = isColumnDirection ? distanceY : distanceX
  const secondaryDistance = isColumnDirection ? distanceX : distanceY

  return primaryDistance * primaryDistance + secondaryDistance * 0.01
}

function insertionTargetForLaneDrop(
  event: TargetedDragEvent<HTMLDivElement>,
  laneWidgets: WidgetInstance[],
  draggingWidgetId?: string,
): WidgetInsertionTarget | undefined {
  const lane = event.currentTarget
  const flexDirection = window.getComputedStyle(lane).flexDirection
  const isColumnDirection = flexDirection.startsWith("column")
  const widgetElements = Array.from(
    lane.querySelectorAll<HTMLElement>("[data-widget-id]"),
  ).filter((element) => element.dataset.widgetId !== draggingWidgetId)

  if (widgetElements.length === 0) {
    const hasOnlyDraggedWidget =
      laneWidgets.length > 0 &&
      laneWidgets.every((widget) => widget.id === draggingWidgetId)

    return hasOnlyDraggedWidget ? undefined : { position: "after" }
  }

  const closestElement = widgetElements.reduce((closest, element) => {
    const closestDistance = distanceFromPointToRect(
      event.clientX,
      event.clientY,
      closest.getBoundingClientRect(),
      isColumnDirection,
    )
    const elementDistance = distanceFromPointToRect(
      event.clientX,
      event.clientY,
      element.getBoundingClientRect(),
      isColumnDirection,
    )

    return elementDistance < closestDistance ? element : closest
  })
  const targetWidgetId = closestElement.dataset.widgetId

  if (targetWidgetId === undefined) {
    return undefined
  }

  return {
    targetWidgetId,
    position: insertPositionForElementDrop(
      lane,
      closestElement,
      event.clientX,
      event.clientY,
    ),
  }
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
          { lane: widget.lane },
          widget.id,
          insertPositionForDrop(event),
        )
      },
      [onDropWidget, onInsertionTargetChange, widget.id, widget.lane],
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
        data-widget-id={widget.id}
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
        <div
          className={cn(styles.widgetBody, {
            [styles.minimizedWidgetBody]: widget.isMinimized,
          })}
        >
          {renderWidgetContent(widget, onSendCommand)}
        </div>
      </article>
    )
  },
)
WidgetCard.displayName = "WidgetCard"

export const WidgetLane: FC<WidgetLaneProps> = memo(
  ({
    className,
    draggingWidgetId,
    isDropTarget,
    lane,
    onAddClick,
    onDragEnd,
    onDragStart,
    onDropTargetChange,
    onDropWidget,
    onRemoveWidget,
    onSendCommand,
    onToggleWidgetMinimized,
    showAddButton = true,
    widgets,
  }) => {
    const laneWidgets = useMemo(
      () => widgetsForLane(widgets, lane),
      [lane, widgets],
    )
    const [insertionTarget, setInsertionTarget] =
      useState<WidgetInsertionTarget>()
    const updateInsertionTarget = useCallback(
      (target?: WidgetInsertionTarget) => {
        const normalizedTarget = normalizeInsertionTarget(
          target,
          laneWidgets,
          draggingWidgetId,
        )

        setInsertionTarget((currentTarget) =>
          insertionTargetsAreEqual(currentTarget, normalizedTarget)
            ? currentTarget
            : normalizedTarget,
        )
      },
      [draggingWidgetId, laneWidgets],
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
        onDropTargetChange(lane)
        const eventTarget = event.target
        if (eventTarget instanceof Element) {
          const hoveredWidget = eventTarget.closest<HTMLElement>(
            "[data-widget-id]",
          )
          if (
            hoveredWidget !== null &&
            event.currentTarget.contains(hoveredWidget) &&
            hoveredWidget.dataset.widgetId === draggingWidgetId
          ) {
            updateInsertionTarget(undefined)
            return
          }
        }

        updateInsertionTarget(
          insertionTargetForLaneDrop(event, laneWidgets, draggingWidgetId),
        )

        if (event.dataTransfer !== null) {
          event.dataTransfer.dropEffect = "move"
        }
      },
      [
        draggingWidgetId,
        lane,
        laneWidgets,
        onDropTargetChange,
        updateInsertionTarget,
      ],
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
        const target = normalizeInsertionTarget(
          insertionTarget ??
            insertionTargetForLaneDrop(event, laneWidgets, draggingWidgetId),
          laneWidgets,
          draggingWidgetId,
        )
        onDropTargetChange(undefined)
        updateInsertionTarget(undefined)

        const draggedWidgetId = readDraggedWidgetId(event)
        if (draggedWidgetId.length === 0) {
          return
        }

        if (target === undefined) {
          return
        }

        onDropWidget(
          draggedWidgetId,
          { lane },
          target.targetWidgetId,
          target.position,
        )
      },
      [
        draggingWidgetId,
        insertionTarget,
        lane,
        laneWidgets,
        onDropTargetChange,
        onDropWidget,
        updateInsertionTarget,
      ],
    )

    const handleAddDragOver = useCallback(
      (event: TargetedDragEvent<HTMLButtonElement>) => {
        event.preventDefault()
        onDropTargetChange(lane)
        updateInsertionTarget(undefined)
        if (event.dataTransfer !== null) {
          event.dataTransfer.dropEffect = "move"
        }
      },
      [lane, onDropTargetChange, updateInsertionTarget],
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

        onDropWidget(draggedWidgetId, { lane })
      },
      [lane, onDropTargetChange, onDropWidget, updateInsertionTarget],
    )

    const handleInsertionMarkerDragOver = useCallback(
      (
        event: TargetedDragEvent<HTMLDivElement>,
        target: WidgetInsertionTarget,
      ) => {
        event.preventDefault()
        event.stopPropagation()
        onDropTargetChange(lane)
        updateInsertionTarget(target)

        if (event.dataTransfer !== null) {
          event.dataTransfer.dropEffect = "move"
        }
      },
      [lane, onDropTargetChange, updateInsertionTarget],
    )

    const handleInsertionMarkerDrop = useCallback(
      (
        event: TargetedDragEvent<HTMLDivElement>,
        target: WidgetInsertionTarget,
      ) => {
        event.preventDefault()
        event.stopPropagation()
        onDropTargetChange(undefined)
        updateInsertionTarget(undefined)

        const draggedWidgetId = readDraggedWidgetId(event)
        if (draggedWidgetId.length === 0) {
          return
        }

        onDropWidget(
          draggedWidgetId,
          { lane },
          target.targetWidgetId,
          target.position,
        )
      },
      [lane, onDropTargetChange, onDropWidget, updateInsertionTarget],
    )

    const renderInsertionMarker = (target: WidgetInsertionTarget) => (
      <div
        aria-hidden="true"
        className={styles.insertionMarker}
        onDragOver={(event) => {
          handleInsertionMarkerDragOver(event, target)
        }}
        onDrop={(event) => {
          handleInsertionMarkerDrop(event, target)
        }}
      />
    )

    return (
      <div
        className={cn(styles.lane, className, {
          [styles.dragActive]: draggingWidgetId !== undefined,
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
              insertionTarget.position === "before"
                ? renderInsertionMarker(insertionTarget)
                : null}
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
              {isInsertionTarget && insertionTarget.position === "after"
                ? renderInsertionMarker(insertionTarget)
                : null}
            </Fragment>
          )
        })}
        {showInsertionMarker &&
        insertionTarget.targetWidgetId === undefined
          ? renderInsertionMarker(insertionTarget)
          : null}
        {showAddButton && draggingWidgetId === undefined ? (
          <button
            aria-label="Добавить виджет"
            className={styles.addButton}
            title="Добавить виджет"
            type="button"
            onClick={() => {
              onAddClick({ lane })
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
    const [dropTargetLane, setDropTargetLane] = useState<WidgetLaneId>()
    const topLane: WidgetLaneId =
      side === "left" ? "panel-left-top" : "panel-right-top"
    const bottomLane: WidgetLaneId =
      side === "left" ? "panel-left-bottom" : "panel-right-bottom"

    useEffect(() => {
      if (props.draggingWidgetId === undefined) {
        setDropTargetLane(undefined)
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
          className={styles.topLane}
          isDropTarget={dropTargetLane === topLane}
          lane={topLane}
          onDropTargetChange={setDropTargetLane}
        />
        <WidgetLane
          {...props}
          className={styles.bottomLane}
          isDropTarget={dropTargetLane === bottomLane}
          lane={bottomLane}
          onDropTargetChange={setDropTargetLane}
        />
      </aside>
    )
  },
)
WidgetPanel.displayName = "WidgetPanel"

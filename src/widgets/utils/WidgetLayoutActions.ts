import {
  createWidgetId,
  normalizeWidgetOrders,
  widgetsForLane,
} from "./WidgetLayoutStorage"
import {
  WidgetAddTarget,
  WidgetInstance,
  WidgetType,
} from "../types/WidgetTypes"

export type InsertPosition = "before" | "after"

export function appendWidget(
  widgets: WidgetInstance[],
  type: WidgetType,
  target: WidgetAddTarget,
) {
  const lane = widgetsForLane(widgets, target.side, target.alignment)
  return normalizeWidgetOrders([
    ...widgets,
    {
      id: createWidgetId(type),
      type,
      side: target.side,
      alignment: target.alignment,
      order: lane.length,
      isMinimized: false,
    },
  ])
}

export function moveWidget(
  widgets: WidgetInstance[],
  widgetId: string,
  target: WidgetAddTarget,
  targetWidgetId?: string,
  position: InsertPosition = "after",
) {
  const movedWidget = widgets.find((widget) => widget.id === widgetId)
  if (movedWidget === undefined) {
    return widgets
  }

  const rest = widgets.filter((widget) => widget.id !== widgetId)
  const lane = widgetsForLane(rest, target.side, target.alignment)
  const targetIndex = lane.findIndex((widget) => widget.id === targetWidgetId)
  const insertAt =
    targetIndex === -1
      ? lane.length
      : targetIndex + (position === "after" ? 1 : 0)
  const nextLane = [
    ...lane.slice(0, insertAt),
    {
      ...movedWidget,
      side: target.side,
      alignment: target.alignment,
      order: insertAt,
    },
    ...lane.slice(insertAt),
  ]
  const otherWidgets = rest.filter(
    (widget) =>
      widget.side !== target.side || widget.alignment !== target.alignment,
  )

  return normalizeWidgetOrders([...otherWidgets, ...nextLane])
}

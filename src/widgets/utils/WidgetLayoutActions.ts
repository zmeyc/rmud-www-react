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
  const lane = widgetsForLane(widgets, target.lane)
  return normalizeWidgetOrders([
    ...widgets,
    {
      id: createWidgetId(type),
      type,
      lane: target.lane,
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
  const lane = widgetsForLane(rest, target.lane)
  const targetIndex = lane.findIndex((widget) => widget.id === targetWidgetId)
  const insertAt =
    targetIndex === -1
      ? lane.length
      : targetIndex + (position === "after" ? 1 : 0)
  const nextLane = [
    ...lane.slice(0, insertAt),
    {
      ...movedWidget,
      lane: target.lane,
      order: insertAt,
    },
    ...lane.slice(insertAt),
  ]
  const otherWidgets = rest.filter((widget) => widget.lane !== target.lane)

  return normalizeWidgetOrders([...otherWidgets, ...nextLane])
}

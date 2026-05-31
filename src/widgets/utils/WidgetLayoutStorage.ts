import { isWidgetType } from "./WidgetRegistry"
import {
  WidgetInstance,
  WidgetLaneId,
  WidgetType,
} from "../types/WidgetTypes"

const storageKey = "rmud.widgetLayout.v2"

export const widgetLanes: WidgetLaneId[] = [
  "panel-left-top",
  "panel-left-bottom",
  "panel-right-top",
  "panel-right-bottom",
  "game-top-left",
  "game-top-right",
  "game-bottom-right",
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isWidgetLane(value: unknown): value is WidgetLaneId {
  return widgetLanes.some((lane) => lane === value)
}

export function createWidgetId(type: WidgetType) {
  return `${type}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 9)}`
}

function createDefaultWidgetLayout(): WidgetInstance[] {
  return [
    {
      id: createWidgetId("movement"),
      type: "movement",
      lane: "panel-right-bottom",
      order: 0,
      isMinimized: false,
    },
  ]
}

export function widgetsForLane(
  widgets: WidgetInstance[],
  lane: WidgetLaneId,
) {
  return widgets
    .filter((widget) => widget.lane === lane)
    .sort((first, second) => first.order - second.order)
}

export function normalizeWidgetOrders(widgets: WidgetInstance[]) {
  const normalized: WidgetInstance[] = []
  for (const lane of widgetLanes) {
    widgetsForLane(widgets, lane).forEach((widget, order) => {
      normalized.push({ ...widget, order })
    })
  }
  return normalized
}

function parseStoredWidget(
  value: unknown,
  fallbackOrder: number,
): WidgetInstance | undefined {
  if (!isRecord(value)) {
    return undefined
  }

  const { id, type, lane, order, isMinimized } = value
  if (!isWidgetType(type) || !isWidgetLane(lane)) {
    return undefined
  }

  return {
    id: typeof id === "string" && id.length > 0 ? id : createWidgetId(type),
    type,
    lane,
    order: typeof order === "number" ? order : fallbackOrder,
    isMinimized: isMinimized === true,
  }
}

export function loadWidgetLayout() {
  try {
    const storedValue = localStorage.getItem(storageKey)
    if (storedValue === null) {
      return createDefaultWidgetLayout()
    }

    const parsedValue = JSON.parse(storedValue) as unknown
    if (!Array.isArray(parsedValue)) {
      return createDefaultWidgetLayout()
    }

    const widgets = parsedValue.flatMap((value, index) => {
      const widget = parseStoredWidget(value, index)
      return widget === undefined ? [] : [widget]
    })
    return normalizeWidgetOrders(widgets)
  } catch (_error) {
    return createDefaultWidgetLayout()
  }
}

export function saveWidgetLayout(widgets: WidgetInstance[]) {
  try {
    localStorage.setItem(
      storageKey,
      JSON.stringify(normalizeWidgetOrders(widgets)),
    )
  } catch (_error) {
    return
  }
}

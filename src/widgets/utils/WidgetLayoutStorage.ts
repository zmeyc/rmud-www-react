import { isWidgetType } from "./WidgetRegistry"
import {
  WidgetAlignment,
  WidgetInstance,
  WidgetSide,
  WidgetType,
} from "../types/WidgetTypes"

const storageKey = "rmud.widgetLayout.v1"

export const widgetSides: WidgetSide[] = ["left", "right"]
export const widgetAlignments: WidgetAlignment[] = ["top", "bottom"]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isWidgetSide(value: unknown): value is WidgetSide {
  return value === "left" || value === "right"
}

function isWidgetAlignment(value: unknown): value is WidgetAlignment {
  return value === "top" || value === "bottom"
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
      side: "right",
      alignment: "bottom",
      order: 0,
      isMinimized: false,
    },
  ]
}

export function widgetsForLane(
  widgets: WidgetInstance[],
  side: WidgetSide,
  alignment: WidgetAlignment,
) {
  return widgets
    .filter((widget) => widget.side === side && widget.alignment === alignment)
    .sort((first, second) => first.order - second.order)
}

export function normalizeWidgetOrders(widgets: WidgetInstance[]) {
  const normalized: WidgetInstance[] = []
  for (const side of widgetSides) {
    for (const alignment of widgetAlignments) {
      widgetsForLane(widgets, side, alignment).forEach((widget, order) => {
        normalized.push({ ...widget, order })
      })
    }
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

  const { id, type, side, alignment, order, isMinimized } = value
  if (!isWidgetType(type) || !isWidgetSide(side) || !isWidgetAlignment(alignment)) {
    return undefined
  }

  return {
    id: typeof id === "string" && id.length > 0 ? id : createWidgetId(type),
    type,
    side,
    alignment,
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

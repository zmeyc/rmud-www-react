import {
  DefaultWidgetDefinition,
  StoredWidgetInstance,
  WidgetDefinition,
  WidgetInstance,
  WidgetLaneId,
  WidgetLayoutState,
} from "../types/WidgetTypes"

const storageKey = "rmud.widgetLayout.v6"

export const widgetLanes: WidgetLaneId[] = [
  "panel-left-top",
  "panel-left-bottom",
  "panel-right-top",
  "panel-right-bottom",
  "game-top-left",
  "game-top-right",
  "game-bottom-right",
]

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isWidgetLane(value: unknown): value is WidgetLaneId {
  return widgetLanes.some((lane) => lane === value)
}

export function createWidgetId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 9)}`
}

export function parseStoredWidgetLayout(
  value: Record<string, unknown>,
  fallbackOrder: number,
): WidgetLayoutState | undefined {
  const { id, lane, order, isMinimized } = value
  if (!isWidgetLane(lane)) {
    return undefined
  }

  return {
    id: typeof id === "string" && id.length > 0 ? id : createWidgetId("widget"),
    lane,
    order: typeof order === "number" ? order : fallbackOrder,
    isMinimized: isMinimized === true,
  }
}

function createDefaultWidgetLayout(
  defaultWidgets: readonly DefaultWidgetDefinition[],
) {
  return normalizeWidgetOrders(
    defaultWidgets.map(({ lane, widget }, order) =>
      widget.create({
        id: createWidgetId(widget.id),
        lane,
        order,
        isMinimized: false,
      }),
    ),
  )
}

export function widgetsForLane(
  widgets: readonly WidgetInstance[],
  lane: WidgetLaneId,
) {
  return widgets
    .filter((widget) => widget.lane === lane)
    .sort((first, second) => first.order - second.order)
}

export function normalizeWidgetOrders(widgets: readonly WidgetInstance[]) {
  const normalized: WidgetInstance[] = []
  for (const lane of widgetLanes) {
    widgetsForLane(widgets, lane).forEach((widget, order) => {
      normalized.push(widget.withLayout({ order }))
    })
  }
  return normalized
}

function parseStoredWidget(
  value: unknown,
  fallbackOrder: number,
  availableWidgets: readonly WidgetDefinition[],
) {
  for (const widget of availableWidgets) {
    const parsedWidget = widget.parse(value, fallbackOrder)
    if (parsedWidget !== undefined) {
      return parsedWidget
    }
  }

  return undefined
}

export interface LoadWidgetLayoutOptions {
  availableWidgets: readonly WidgetDefinition[]
  defaultWidgets: readonly DefaultWidgetDefinition[]
}

export function loadWidgetLayout({
  availableWidgets,
  defaultWidgets,
}: LoadWidgetLayoutOptions) {
  try {
    const storedValue = localStorage.getItem(storageKey)
    if (storedValue === null) {
      return createDefaultWidgetLayout(defaultWidgets)
    }

    const parsedValue = JSON.parse(storedValue) as unknown
    if (!Array.isArray(parsedValue)) {
      return createDefaultWidgetLayout(defaultWidgets)
    }

    const widgets = parsedValue.flatMap((value, index) => {
      const widget = parseStoredWidget(value, index, availableWidgets)
      return widget === undefined ? [] : [widget]
    })
    return normalizeWidgetOrders(widgets)
  } catch (_error) {
    return createDefaultWidgetLayout(defaultWidgets)
  }
}

export function saveWidgetLayout(widgets: readonly WidgetInstance[]) {
  try {
    const storedWidgets: StoredWidgetInstance[] = normalizeWidgetOrders(
      widgets,
    ).map((widget) => widget.serialize())
    localStorage.setItem(storageKey, JSON.stringify(storedWidgets))
  } catch (_error) {
    return
  }
}

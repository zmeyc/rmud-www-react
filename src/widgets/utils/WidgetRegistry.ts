import { WidgetType } from "../types/WidgetTypes"

export interface WidgetDefinition {
  type: WidgetType
  title: string
}

export const widgetDefinitions: WidgetDefinition[] = [
  {
    type: "movement",
    title: "Движение",
  },
]

export function titleForWidgetType(type: WidgetType) {
  switch (type) {
    case "movement":
      return "Движение"
  }
}

export function isWidgetType(value: unknown): value is WidgetType {
  return widgetDefinitions.some((definition) => definition.type === value)
}

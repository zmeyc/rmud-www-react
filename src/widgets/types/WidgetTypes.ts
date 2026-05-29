export type WidgetAlignment = "top" | "bottom"
export type WidgetSide = "left" | "right"
export type WidgetType = "movement"

export interface WidgetInstance {
  id: string
  type: WidgetType
  side: WidgetSide
  alignment: WidgetAlignment
  order: number
  isMinimized: boolean
}

export interface WidgetAddTarget {
  side: WidgetSide
  alignment: WidgetAlignment
}

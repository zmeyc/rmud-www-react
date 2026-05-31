export type WidgetLaneId =
  | "panel-left-top"
  | "panel-left-bottom"
  | "panel-right-top"
  | "panel-right-bottom"
  | "game-top-left"
  | "game-top-right"
  | "game-bottom-right"
export type WidgetSide = "left" | "right"
export type WidgetType = "datetime" | "movement"

export interface WidgetInstance {
  id: string
  type: WidgetType
  lane: WidgetLaneId
  order: number
  isMinimized: boolean
}

export interface WidgetAddTarget {
  lane: WidgetLaneId
}

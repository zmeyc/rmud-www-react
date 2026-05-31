import type { ComponentChildren } from "preact"

export type WidgetLaneId =
  | "panel-left-top"
  | "panel-left-bottom"
  | "panel-right-top"
  | "panel-right-bottom"
  | "game-top-left"
  | "game-top-right"
  | "game-bottom-right"
export type WidgetSide = "left" | "right"

export interface DateTimeWidgetSettings {
  showDate: boolean
  showTime: boolean
  showWeekday: boolean
}

export interface MovementWidgetSettings {
  showAdditionalCommands: boolean
}

export interface WidgetLayoutState {
  id: string
  lane: WidgetLaneId
  order: number
  isMinimized: boolean
}

export interface WidgetRenderContext {
  onChangeWidget: (widget: WidgetInstance) => void
  onSendCommand: (command: string) => void
}

export interface StoredWidgetInstance extends WidgetLayoutState {
  type: string
  settings: unknown
}

export interface WidgetInstance extends WidgetLayoutState {
  isCompact: () => boolean
  renderContent: (context: WidgetRenderContext) => ComponentChildren
  renderSettings: (context: WidgetRenderContext) => ComponentChildren
  serialize: () => StoredWidgetInstance
  title: () => string
  withLayout: (layout: Partial<WidgetLayoutState>) => WidgetInstance
  withMinimized: (isMinimized: boolean) => WidgetInstance
}

export interface WidgetDefinition {
  id: string
  create: (layout: WidgetLayoutState) => WidgetInstance
  parse: (value: unknown, fallbackOrder: number) => WidgetInstance | undefined
  title: () => string
}

export interface DefaultWidgetDefinition {
  lane: WidgetLaneId
  widget: WidgetDefinition
}

export interface WidgetAddTarget {
  lane: WidgetLaneId
}

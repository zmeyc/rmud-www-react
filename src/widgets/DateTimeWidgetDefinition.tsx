import { DateTimeWidget } from "./DateTimeWidget"
import { DateTimeWidgetSettingsPanel } from "./DateTimeWidgetSettingsPanel"
import {
  DateTimeWidgetSettings,
  StoredWidgetInstance,
  WidgetDefinition,
  WidgetInstance,
  WidgetLayoutState,
} from "./types/WidgetTypes"
import {
  isRecord,
  parseStoredWidgetLayout,
} from "./utils/WidgetLayoutStorage"

const widgetType = "datetime"
const widgetTitle = "Дата"

interface DateTimeWidgetState extends WidgetLayoutState {
  settings: DateTimeWidgetSettings
}

function defaultSettings(): DateTimeWidgetSettings {
  return {
    showDate: true,
    showTime: true,
    showWeekday: true,
  }
}

function parseSettings(value: unknown): DateTimeWidgetSettings {
  if (!isRecord(value)) {
    return defaultSettings()
  }

  return {
    showDate: value.showDate !== false,
    showTime: value.showTime !== false,
    showWeekday: value.showWeekday !== false,
  }
}

function createDateTimeWidget(state: DateTimeWidgetState): WidgetInstance {
  return {
    ...state,
    isCompact: () => true,
    renderContent: () => <DateTimeWidget settings={state.settings} />,
    renderSettings: ({ onChangeWidget }) => (
      <DateTimeWidgetSettingsPanel
        settings={state.settings}
        onChangeSettings={(settings) => {
          onChangeWidget(createDateTimeWidget({ ...state, settings }))
        }}
      />
    ),
    serialize: (): StoredWidgetInstance => ({
      ...state,
      type: widgetType,
    }),
    title: () => widgetTitle,
    withLayout: (layout) => createDateTimeWidget({ ...state, ...layout }),
    withMinimized: (isMinimized) =>
      createDateTimeWidget({ ...state, isMinimized }),
  }
}

export const dateTimeWidgetDefinition: WidgetDefinition = {
  id: widgetType,
  create: (layout) =>
    createDateTimeWidget({
      ...layout,
      settings: defaultSettings(),
    }),
  parse: (value, fallbackOrder) => {
    if (!isRecord(value) || value.type !== widgetType) {
      return undefined
    }

    const layout = parseStoredWidgetLayout(value, fallbackOrder)
    if (layout === undefined) {
      return undefined
    }

    return createDateTimeWidget({
      ...layout,
      settings: parseSettings(value.settings),
    })
  },
  title: () => widgetTitle,
}

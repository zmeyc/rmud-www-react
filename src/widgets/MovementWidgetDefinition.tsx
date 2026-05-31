import { MovementWidget } from "./MovementWidget"
import { MovementWidgetSettingsPanel } from "./MovementWidgetSettingsPanel"
import {
  MovementWidgetSettings,
  StoredWidgetInstance,
  WidgetDefinition,
  WidgetInstance,
  WidgetLayoutState,
} from "./types/WidgetTypes"
import {
  isRecord,
  parseStoredWidgetLayout,
} from "./utils/WidgetLayoutStorage"

const widgetType = "movement"
const widgetTitle = "Движение"

interface MovementWidgetState extends WidgetLayoutState {
  settings: MovementWidgetSettings
}

function defaultSettings(): MovementWidgetSettings {
  return {
    showAdditionalCommands: false,
  }
}

function parseSettings(value: unknown): MovementWidgetSettings {
  if (!isRecord(value)) {
    return defaultSettings()
  }

  return {
    showAdditionalCommands: value.showAdditionalCommands !== false,
  }
}

function createMovementWidget(state: MovementWidgetState): WidgetInstance {
  return {
    ...state,
    isCompact: () => true,
    renderContent: ({ onSendCommand }) => (
      <MovementWidget
        settings={state.settings}
        onSendCommand={onSendCommand}
      />
    ),
    renderSettings: ({ onChangeWidget }) => (
      <MovementWidgetSettingsPanel
        settings={state.settings}
        onChangeSettings={(settings) => {
          onChangeWidget(createMovementWidget({ ...state, settings }))
        }}
      />
    ),
    serialize: (): StoredWidgetInstance => ({
      ...state,
      type: widgetType,
    }),
    title: () => widgetTitle,
    withLayout: (layout) => createMovementWidget({ ...state, ...layout }),
    withMinimized: (isMinimized) =>
      createMovementWidget({ ...state, isMinimized }),
  }
}

export const movementWidgetDefinition: WidgetDefinition = {
  id: widgetType,
  create: (layout) =>
    createMovementWidget({
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

    return createMovementWidget({
      ...layout,
      settings: parseSettings(value.settings),
    })
  },
  title: () => widgetTitle,
}

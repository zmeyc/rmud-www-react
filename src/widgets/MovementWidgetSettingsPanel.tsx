import { ComponentProps, FC, memo, useCallback } from "preact/compat"
import cn from "classnames"
import { WidgetSettingsCheckbox } from "./components/WidgetSettingsCheckbox"
import { MovementWidgetSettings } from "./types/WidgetTypes"
import styles from "./components/WidgetSettingsDialog.module.css"

export interface MovementWidgetSettingsPanelProps
  extends ComponentProps<"div"> {
  className?: string
  settings: MovementWidgetSettings
  onChangeSettings: (settings: MovementWidgetSettings) => void
}

export const MovementWidgetSettingsPanel: FC<MovementWidgetSettingsPanelProps> =
  memo(({ className, settings, onChangeSettings, ...props }) => {
    const updateSetting = useCallback(
      (key: keyof MovementWidgetSettings, value: boolean) => {
        onChangeSettings({
          ...settings,
          [key]: value,
        })
      },
      [onChangeSettings, settings],
    )

    return (
      <div
        {...props}
        className={cn(styles.checkboxList, className)}
      >
        <WidgetSettingsCheckbox
          checked={settings.showAdditionalCommands}
          label="Убежать / отступить / смотреть"
          onChange={(checked) => {
            updateSetting("showAdditionalCommands", checked)
          }}
        />
      </div>
    )
  })
MovementWidgetSettingsPanel.displayName = "MovementWidgetSettingsPanel"

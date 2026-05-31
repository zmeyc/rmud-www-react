import { ComponentProps, FC, memo, useCallback } from "preact/compat"
import cn from "classnames"
import { WidgetSettingsCheckbox } from "./components/WidgetSettingsCheckbox"
import { DateTimeWidgetSettings } from "./types/WidgetTypes"
import styles from "./components/WidgetSettingsDialog.module.css"

export interface DateTimeWidgetSettingsPanelProps
  extends ComponentProps<"div"> {
  className?: string
  settings: DateTimeWidgetSettings
  onChangeSettings: (settings: DateTimeWidgetSettings) => void
}

function enabledSettingCount(settings: DateTimeWidgetSettings) {
  return [
    settings.showDate,
    settings.showTime,
    settings.showWeekday,
  ].filter((isEnabled) => isEnabled).length
}

export const DateTimeWidgetSettingsPanel: FC<DateTimeWidgetSettingsPanelProps> =
  memo(({ className, settings, onChangeSettings, ...props }) => {
    const updateSetting = useCallback(
      (key: keyof DateTimeWidgetSettings, value: boolean) => {
        const nextSettings = {
          ...settings,
          [key]: value,
        }
        if (enabledSettingCount(nextSettings) === 0) {
          return
        }

        onChangeSettings(nextSettings)
      },
      [onChangeSettings, settings],
    )

    return (
      <div
        {...props}
        className={cn(styles.checkboxList, className)}
      >
        <WidgetSettingsCheckbox
          checked={settings.showDate}
          label="Дата"
          onChange={(checked) => {
            updateSetting("showDate", checked)
          }}
        />
        <WidgetSettingsCheckbox
          checked={settings.showWeekday}
          label="День недели"
          onChange={(checked) => {
            updateSetting("showWeekday", checked)
          }}
        />
        <WidgetSettingsCheckbox
          checked={settings.showTime}
          label="Время"
          onChange={(checked) => {
            updateSetting("showTime", checked)
          }}
        />
      </div>
    )
  })
DateTimeWidgetSettingsPanel.displayName = "DateTimeWidgetSettingsPanel"

import { ComponentProps, FC, memo, useEffect, useState } from "preact/compat"
import cn from "classnames"
import styles from "./DateTimeWidget.module.css"

export interface DateTimeWidgetProps extends ComponentProps<"div"> {
  className?: string
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  day: "2-digit",
  month: "long",
  year: "numeric",
})

const fullDateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
})

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  hourCycle: "h23",
  minute: "2-digit",
})

const weekdayFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
})

function localDateTimeValue(date: Date) {
  const year = date.getFullYear().toString().padStart(4, "0")
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const day = date.getDate().toString().padStart(2, "0")
  const hour = date.getHours().toString().padStart(2, "0")
  const minute = date.getMinutes().toString().padStart(2, "0")

  return `${year}-${month}-${day}T${hour}:${minute}`
}

export const DateTimeWidget: FC<DateTimeWidgetProps> = memo(
  ({ className, ...props }) => {
    const [currentDate, setCurrentDate] = useState(() => new Date())
    const dateText = dateFormatter.format(currentDate)
    const fullDateText = fullDateFormatter.format(currentDate)
    const timeText = timeFormatter.format(currentDate)
    const weekdayText = weekdayFormatter.format(currentDate)
    const dateTimeValue = localDateTimeValue(currentDate)

    useEffect(() => {
      const intervalId = window.setInterval(() => {
        setCurrentDate(new Date())
      }, 1000)

      return () => {
        window.clearInterval(intervalId)
      }
    }, [])

    return (
      <div
        {...props}
        aria-label={`${fullDateText}, ${timeText}`}
        className={cn(styles.root, className)}
      >
        <div className={styles.dateBlock}>
          <time
            className={styles.date}
            dateTime={dateTimeValue}
          >
            {dateText}
          </time>
          <span className={styles.weekday}>{weekdayText}</span>
        </div>
        <time
          className={styles.time}
          dateTime={dateTimeValue}
        >
          {timeText}
        </time>
      </div>
    )
  },
)
DateTimeWidget.displayName = "DateTimeWidget"

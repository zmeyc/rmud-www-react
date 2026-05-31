import { ComponentProps, FC, memo, useEffect, useRef } from "preact/compat"
import cn from "classnames"
import { scrollToBottom } from "../utils/html"
import styles from "./MirrorWidget.module.css"

export type MirrorWidgetItem =
  | {
      id: number
      type: "html"
      html: string
    }
  | {
      id: number
      type: "link"
      text: string
      href: string
    }

export interface MirrorWidgetProps extends ComponentProps<"div"> {
  className?: string
  items: MirrorWidgetItem[]
}

function isHttpUrl(href: string) {
  try {
    const url = new URL(href)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

export const MirrorWidget: FC<MirrorWidgetProps> = memo(
  ({ className, items, ...props }) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const lastItemId =
      items.length === 0 ? undefined : items[items.length - 1].id

    useEffect(() => {
      if (lastItemId === undefined) {
        return
      }

      const container = containerRef.current
      if (container === null) {
        return
      }

      scrollToBottom(container)
    }, [lastItemId])

    return (
      <div
        {...props}
        className={cn(styles.root, className)}
        ref={containerRef}
      >
        <pre className={styles.pre}>
          {items.map((item) => {
            switch (item.type) {
              case "html":
                return (
                  <span
                    // eslint-disable-next-line react/no-danger -- Mirrors sanitized game HTML.
                    dangerouslySetInnerHTML={{ __html: item.html }}
                    key={item.id}
                  />
                )
              case "link":
                return (
                  <span key={item.id}>
                    {isHttpUrl(item.href) ? (
                      <a
                        href={item.href}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {item.text}
                      </a>
                    ) : (
                      item.text
                    )}
                  </span>
                )
            }
          })}
        </pre>
      </div>
    )
  },
)
MirrorWidget.displayName = "MirrorWidget"

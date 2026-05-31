import {
  ComponentProps,
  FC,
  TargetedEvent,
  memo,
  useCallback,
  useMemo,
  useRef,
} from "preact/compat"
import cn from "classnames"
import {
  maximumMirrorLineCount,
  useMirrorLineCount,
} from "./hooks/useMirrorLineCount"
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

interface MirrorWidgetLine {
  html: string
  id: number
}

interface ResizeState {
  lineHeight: number
  pointerId: number
  startLineCount: number
  startY: number
}

function isHttpUrl(href: string) {
  try {
    const url = new URL(href)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

function escapeHtmlText(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

function escapeHtmlAttribute(text: string) {
  return escapeHtmlText(text).replace(/"/g, "&quot;")
}

function appendLineBreak(lines: string[]) {
  lines.push("")
  if (lines.length > maximumMirrorLineCount) {
    lines.shift()
  }
}

function wrapHtmlWithElements(html: string, wrappers: Element[]) {
  return wrappers.reduceRight((wrappedHtml, wrapper) => {
    const clone = wrapper.cloneNode(false) as Element
    clone.innerHTML = wrappedHtml

    return clone.outerHTML
  }, html)
}

function appendWrappedText(
  lines: string[],
  text: string,
  wrappers: Element[],
) {
  const parts = text.split(/\r\n|\r|\n/)
  parts.forEach((part, index) => {
    if (index > 0) {
      appendLineBreak(lines)
    }

    if (part.length === 0) {
      return
    }

    lines[lines.length - 1] += wrapHtmlWithElements(
      escapeHtmlText(part),
      wrappers,
    )
  })
}

function appendHtmlNode(
  lines: string[],
  node: Node,
  wrappers: Element[],
) {
  if (node.nodeType === Node.TEXT_NODE) {
    appendWrappedText(lines, node.textContent ?? "", wrappers)
    return
  }

  if (!(node instanceof Element)) {
    return
  }

  if (node.tagName === "BR") {
    appendLineBreak(lines)
    return
  }

  const nextWrappers = [...wrappers, node]
  node.childNodes.forEach((childNode) => {
    appendHtmlNode(lines, childNode, nextWrappers)
  })
}

function appendHtmlItem(lines: string[], html: string) {
  const template = document.createElement("template")
  template.innerHTML = html
  template.content.childNodes.forEach((node) => {
    appendHtmlNode(lines, node, [])
  })
}

function linkHtml(text: string, href: string) {
  if (!isHttpUrl(href)) {
    return escapeHtmlText(text)
  }

  return `<a href="${escapeHtmlAttribute(
    href,
  )}" rel="noopener noreferrer" target="_blank">${escapeHtmlText(text)}</a>`
}

function appendLinkItem(lines: string[], text: string, href: string) {
  const parts = text.split(/\r\n|\r|\n/)
  parts.forEach((part, index) => {
    if (index > 0) {
      appendLineBreak(lines)
    }

    if (part.length === 0) {
      return
    }

    lines[lines.length - 1] += linkHtml(part, href)
  })
}

function linesForItems(items: MirrorWidgetItem[]): MirrorWidgetLine[] {
  const lines = [""]
  items.forEach((item) => {
    switch (item.type) {
      case "html":
        appendHtmlItem(lines, item.html)
        break
      case "link":
        appendLinkItem(lines, item.text, item.href)
        break
    }
  })

  return lines.map((html, id) => ({ html, id }))
}

export const MirrorWidget: FC<MirrorWidgetProps> = memo(
  ({ className, items, ...props }) => {
    const rootRef = useRef<HTMLDivElement>(null)
    const resizeStateRef = useRef<ResizeState>()
    const [lineCount, setLineCount] = useMirrorLineCount()
    const lines = useMemo(() => linesForItems(items), [items])
    const visibleLines = lines.slice(-lineCount)

    const handleResizePointerDown = useCallback(
      (event: TargetedEvent<HTMLButtonElement, PointerEvent>) => {
        const root = rootRef.current
        if (root === null) {
          return
        }

        event.preventDefault()
        event.currentTarget.setPointerCapture(event.pointerId)
        resizeStateRef.current = {
          lineHeight:
            Number.parseFloat(window.getComputedStyle(root).lineHeight) || 16,
          pointerId: event.pointerId,
          startLineCount: lineCount,
          startY: event.clientY,
        }
      },
      [lineCount],
    )

    const handleResizePointerMove = useCallback(
      (event: TargetedEvent<HTMLButtonElement, PointerEvent>) => {
        const resizeState = resizeStateRef.current
        if (
          resizeState === undefined ||
          resizeState.pointerId !== event.pointerId
        ) {
          return
        }

        const deltaRows = Math.round(
          (resizeState.startY - event.clientY) / resizeState.lineHeight,
        )
        setLineCount(resizeState.startLineCount + deltaRows)
      },
      [setLineCount],
    )

    const handleResizePointerUp = useCallback(
      (event: TargetedEvent<HTMLButtonElement, PointerEvent>) => {
        const resizeState = resizeStateRef.current
        if (
          resizeState === undefined ||
          resizeState.pointerId !== event.pointerId
        ) {
          return
        }

        event.currentTarget.releasePointerCapture(event.pointerId)
        resizeStateRef.current = undefined
      },
      [],
    )

    const handleResizeKeyDown = useCallback(
      (event: TargetedEvent<HTMLButtonElement, KeyboardEvent>) => {
        switch (event.key) {
          case "ArrowUp":
            event.preventDefault()
            setLineCount(lineCount + 1)
            break
          case "ArrowDown":
            event.preventDefault()
            setLineCount(lineCount - 1)
            break
        }
      },
      [lineCount, setLineCount],
    )

    return (
      <div
        {...props}
        className={cn(styles.root, className)}
        ref={rootRef}
        style={{ height: `${lineCount * 2}ch` }}
      >
        <button
          aria-label="Изменить высоту зеркала"
          className={styles.resizeLine}
          title="Изменить высоту зеркала"
          type="button"
          onKeyDown={handleResizeKeyDown}
          onPointerDown={handleResizePointerDown}
          onPointerMove={handleResizePointerMove}
          onPointerUp={handleResizePointerUp}
        />
        <pre className={styles.pre}>
          {visibleLines.map((line) => (
            <span
              className={styles.line}
              // eslint-disable-next-line react/no-danger -- Mirrors sanitized game HTML.
              dangerouslySetInnerHTML={{ __html: line.html }}
              key={line.id}
            />
          ))}
        </pre>
      </div>
    )
  },
)
MirrorWidget.displayName = "MirrorWidget"

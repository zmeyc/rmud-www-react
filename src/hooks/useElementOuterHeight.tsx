import { RefObject, useEffect, useState } from "preact/compat"

function numericStyleValue(value: string) {
  return Number.parseFloat(value) || 0
}

function measureElementOuterHeight(element: HTMLElement) {
  const style = window.getComputedStyle(element)

  return (
    element.getBoundingClientRect().height +
    numericStyleValue(style.marginTop) +
    numericStyleValue(style.marginBottom)
  )
}

export function useElementOuterHeight(elementRef: RefObject<HTMLElement>) {
  const [outerHeight, setOuterHeight] = useState(0)

  useEffect(() => {
    const element = elementRef.current
    if (element === null) {
      return
    }

    const updateHeight = () => {
      const nextOuterHeight = measureElementOuterHeight(element)
      setOuterHeight((currentOuterHeight) =>
        currentOuterHeight === nextOuterHeight
          ? currentOuterHeight
          : nextOuterHeight,
      )
    }

    updateHeight()

    const resizeObserver = new ResizeObserver(updateHeight)
    resizeObserver.observe(element)

    return () => {
      resizeObserver.disconnect()
    }
  }, [elementRef])

  return outerHeight
}

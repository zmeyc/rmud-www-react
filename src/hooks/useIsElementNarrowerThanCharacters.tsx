import { RefObject, useEffect, useState } from "preact/compat"

function measureCharacterWidth(element: HTMLElement, characters: number) {
  const probe = document.createElement("div")
  probe.style.position = "absolute"
  probe.style.visibility = "hidden"
  probe.style.pointerEvents = "none"
  probe.style.width = `${characters}ch`
  element.appendChild(probe)
  const width = probe.getBoundingClientRect().width
  probe.remove()

  return width
}

export function useIsElementNarrowerThanCharacters(
  elementRef: RefObject<HTMLElement>,
  characters: number,
) {
  const [isNarrow, setIsNarrow] = useState(false)

  useEffect(() => {
    const element = elementRef.current
    if (element === null) {
      return
    }

    const updateWidth = () => {
      const narrowWidth = measureCharacterWidth(element, characters)
      setIsNarrow(element.clientWidth < narrowWidth)
    }

    updateWidth()

    const resizeObserver = new ResizeObserver(updateWidth)
    resizeObserver.observe(element)

    return () => {
      resizeObserver.disconnect()
    }
  }, [characters, elementRef])

  return isNarrow
}

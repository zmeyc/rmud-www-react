import { useEffect, useState } from "preact/hooks"

function formatHeight(height?: number) {
  return height ? `${height}px` : "100vh"
}

export function useVisualViewportHeight() {
  const [height, setHeight] = useState(window.visualViewport?.height)

  useEffect(() => {
    const updateHeight = () => {
      const viewportHeight = window.visualViewport?.height
      if (height != viewportHeight) {
        setHeight(viewportHeight)
      }
    }

    window.visualViewport?.addEventListener("resize", updateHeight)
    return () => {
      window.visualViewport?.removeEventListener("resize", updateHeight)
    }
  }, [height])

  return formatHeight(height)
}

import { Ref, useEffect } from "preact/compat"

export function useScrollWindowToTopWhenElementIsFocused(
  elementRef: Ref<HTMLElement>,
) {
  useEffect(() => {
    const id = window.setInterval(() => {
      const activeElement = document.activeElement
      if (
        activeElement !== null &&
        activeElement === elementRef.current &&
        window.scrollY > 0
      ) {
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
    }, 500)

    return () => {
      clearInterval(id)
    }
  }, [elementRef])
}

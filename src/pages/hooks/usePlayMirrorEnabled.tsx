import { useCallback, useEffect, useState } from "preact/compat"

const storageKey = "rmud.play.mirrorEnabled.v1"

function loadPlayMirrorEnabled() {
  try {
    const storedValue = localStorage.getItem(storageKey)
    return storedValue === null ? true : storedValue === "true"
  } catch (_error) {
    return true
  }
}

export function usePlayMirrorEnabled() {
  const [isMirrorEnabled, setIsMirrorEnabledState] = useState(
    loadPlayMirrorEnabled,
  )

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, isMirrorEnabled.toString())
    } catch (_error) {
      return
    }
  }, [isMirrorEnabled])

  const setIsMirrorEnabled = useCallback((value: boolean) => {
    setIsMirrorEnabledState(value)
  }, [])

  return [isMirrorEnabled, setIsMirrorEnabled] as const
}

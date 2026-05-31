import { useCallback, useEffect, useState } from "preact/compat"

const storageKey = "rmud.mirror.lineCount.v1"

export const minimumMirrorLineCount = 2
export const maximumMirrorLineCount = 18
const defaultMirrorLineCount = 6

export function normalizeMirrorLineCount(value: number) {
  return Math.min(
    Math.max(Math.round(value), minimumMirrorLineCount),
    maximumMirrorLineCount,
  )
}

function loadMirrorLineCount() {
  try {
    const storedValue = localStorage.getItem(storageKey)
    if (storedValue === null) {
      return defaultMirrorLineCount
    }

    return normalizeMirrorLineCount(Number.parseInt(storedValue, 10))
  } catch (_error) {
    return defaultMirrorLineCount
  }
}

export function useMirrorLineCount() {
  const [lineCount, setLineCountState] = useState(loadMirrorLineCount)

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, lineCount.toString())
    } catch (_error) {
      return
    }
  }, [lineCount])

  const setLineCount = useCallback((value: number) => {
    setLineCountState(normalizeMirrorLineCount(value))
  }, [])

  return [lineCount, setLineCount] as const
}

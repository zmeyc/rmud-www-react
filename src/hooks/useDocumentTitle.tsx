import { useEffect } from "preact/hooks"

export function useDocumentTitle(title: string, siteName = "RMUD") {
  useEffect(() => {
    const previous = document.title
    document.title = title.length > 0 ? `${title} - ${siteName}` : siteName
    return () => {
      document.title = previous
    }
  }, [siteName, title])
}

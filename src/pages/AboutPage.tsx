import { ComponentProps, FC, memo } from "preact/compat"
import cn from "classnames"
import { Page } from "../pageparts/pages/Page"
import { useDocumentTitle } from "../hooks/useDocumentTitle"
import styles from "./AboutPage.module.css"

export interface AboutPageProps extends ComponentProps<"div"> {
  className?: string
}

export const AboutPage: FC<AboutPageProps> = memo(({ className, ...props }) => {
  useDocumentTitle("Об игре")

  return (
    <Page
      {...props}
      className={cn(className, styles.root)}
    >
      <p>About page</p>
    </Page>
  )
})
AboutPage.displayName = "AboutPage"

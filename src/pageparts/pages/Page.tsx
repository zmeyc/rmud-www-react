import { ComponentProps, FC, memo } from "preact/compat"
import cn from "classnames"
import { Header } from "../header/Header"
import { TopMenu } from "../navigation/TopMenu"
import { Content } from "../content/Content"
import { Footer } from "../footer/Footer"
import styles from "./Page.module.css"

export interface PageProps extends ComponentProps<"div"> {
  className?: string
}

export const Page: FC<PageProps> = memo(({ className, children, ...props }) => {
  return (
    <div
      {...props}
      className={cn(className, styles.root)}
    >
      <Header className={styles.header} />
      <Content className={styles.content}>
        <nav>
          <TopMenu className={styles.topMenu} />
        </nav>
        {children}
      </Content>
      <Footer className={styles.footer} />
    </div>
  )
})
Page.displayName = "Page"

import { ComponentProps, FC } from "preact/compat"
import cn from "classnames"
import { Header } from "./pageparts/header/Header"
import { Content } from "./pageparts/content/Content"
import { Footer } from "./pageparts/footer/Footer"
import styles from "./Page.module.css"

export interface PageProps extends ComponentProps<"div"> {
  className?: string
}

export const Page: FC<PageProps> = ({ className, ...props }) => {
  return (
    <div {...props} className={cn(className, styles.root)}>
      <Header className={styles.header} />
      <Content className={styles.content}>
        Lorem Ipsum is simply dummy text of the printing and typesetting
        industry. Lorem Ipsum has been the industry's standard dummy text ever
        since the 1500s, when an unknown printer took a galley of type and
        scrambled it to make a type specimen book. It has survived not only five
        centuries, but also the leap into electronic typesetting, remaining
        essentially unchanged. It was popularised in the 1960s with the release
        of Letraset sheets containing Lorem Ipsum passages, and more recently
        with desktop publishing software like Aldus PageMaker including versions
        of Lorem Ipsum
      </Content>
      <Footer className={styles.footer} />
    </div>
  )
}

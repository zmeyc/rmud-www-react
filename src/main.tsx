if (import.meta.env.DEV) {
  import("preact/debug")
}

import { render } from "preact"
import { App } from "./App"
import "./assets/styles/index.css"
import "./assets/styles/blink.css"
import { StrictMode } from "preact/compat"

render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.getElementById("app")!,
)

import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

// https://vitejs.dev/config/
export default defineConfig((command) => ({
  plugins: [preact()],
  css: {
    modules: {
      generateScopedName:
        command.command !== "build" ? "[name]-[local]-[hash:8]" : "-[hash:8]",
    },
  },
}));

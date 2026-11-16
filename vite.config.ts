import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  build: {
    manifest: true,
    target: "es2022",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes("/node_modules/react") ||
            id.includes("/node_modules/scheduler")
          )
            return "react";
          if (id.includes("/src/locales/")) return "languages";
        },
      },
    },
  },
});

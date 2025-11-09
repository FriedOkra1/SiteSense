import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  test: {
    environment: "happy-dom",
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"]
    }
  },
  resolve: {
    alias: {
      "@background": resolve(__dirname, "background"),
      "@content": resolve(__dirname, "content"),
      "@shared": resolve(__dirname, "shared"),
      "@ui": resolve(__dirname, "ui")
    }
  }
});


import { resolve } from "node:path";
import { defineConfig } from "vite";
import webExtension from "@samrum/vite-plugin-web-extension";
import manifest from "./manifest.config";

export default defineConfig(({ mode }) => {
  const isFirefox = mode === "firefox";
  const outDir = resolve(__dirname, "dist", isFirefox ? "firefox" : "chrome");

  return {
    resolve: {
      alias: {
        "@background": resolve(__dirname, "background"),
        "@content": resolve(__dirname, "content"),
        "@shared": resolve(__dirname, "shared"),
        "@ui": resolve(__dirname, "ui")
      }
    },
    build: {
      outDir,
      emptyOutDir: true,
      sourcemap: true
    },
    plugins: [
      webExtension({
        manifest: manifest({ mode }),
        browser: isFirefox ? "firefox" : "chrome"
      })
    ]
  };
});


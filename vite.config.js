import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  publicDir: "public",

  build: {
    outDir: "dist",
    emptyOutDir: true,

    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        weather: resolve(__dirname, "pages/weather.html"),
      },
    },
  },
});

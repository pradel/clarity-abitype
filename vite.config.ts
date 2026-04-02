import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  fmt: {
    sortImports: true,
    printWidth: 80,
  },
  lint: {},
  run: {
    cache: true,
  },
});

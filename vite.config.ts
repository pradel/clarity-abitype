import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  fmt: {
    sortImports: true,
    printWidth: 80,
  },
  lint: {
    options: { typeAware: true, typeCheck: true },
  },
  run: {
    cache: true,
  },
});

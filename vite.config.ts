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
    rules: {
      "typescript/no-redundant-type-constituents": "off",
    },
  },
  run: {
    cache: true,
  },
});

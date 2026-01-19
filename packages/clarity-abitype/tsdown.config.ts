import { defineConfig } from "tsdown";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/stacks-js/index.js",
    "src/clarinet-sdk/index.js",
  ],
  platform: "neutral",
  publint: true,
  exports: true,
  sourcemap: true,
  attw: {
    enabled: true,
    level: "error",
    profile: "esm-only",
  },
  dts: true,
});

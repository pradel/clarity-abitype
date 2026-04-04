import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: [
      "src/index.ts",
      "src/clarinet-sdk/index.js",
      "src/stacks-connect/index.js",
      "src/stacks-js/index.js",
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
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts", "**/*.test-d.ts"],
  },
});

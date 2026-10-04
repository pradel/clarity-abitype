import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: [
      "src/index.ts",
      "src/clarinet-sdk/index.ts",
      "src/config.ts",
      "src/stacks-connect/index.ts",
      "src/stacks-js/index.ts",
      "src/cli/index.ts",
    ],
    platform: "neutral",
    external: [/^node:/],
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

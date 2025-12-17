import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "src/index.ts",
  platform: "neutral",
  publint: true,
  attw: {
    enabled: true,
    level: "error",
    profile: "esm-only",
  },
});

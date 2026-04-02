import {
  getClarinetVitestsArgv,
  vitestSetupFilePath,
} from "@stacks/clarinet-sdk/vitest";
import { defineConfig } from "vite-plus";

export default defineConfig({
  test: {
    environment: "clarinet",
    pool: "forks",
    isolate: false,
    maxWorkers: 1,
    setupFiles: [vitestSetupFilePath],
    environmentOptions: {
      clarinet: {
        ...(await getClarinetVitestsArgv()),
      },
    },
  },
});

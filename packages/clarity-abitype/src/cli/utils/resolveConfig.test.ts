import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, test } from "vite-plus/test";

import { resolveConfig } from "./resolveConfig.js";

async function createRoot() {
  return await mkdtemp(join(tmpdir(), "clarity-abitype-"));
}

describe("resolveConfig", () => {
  test("loads config from .mjs file", async () => {
    const root = await createRoot();
    const path = join(root, "clarity.config.mjs");
    await writeFile(path, 'export default { contracts: [], out: "out.ts" };');

    expect(await resolveConfig(path)).toEqual({
      contracts: [],
      out: "out.ts",
    });
  });

  test("loads config from .ts file", async () => {
    const root = await createRoot();
    const path = join(root, "clarity.config.ts");
    await writeFile(path, 'export default { contracts: [], out: "out.ts" };');

    expect(await resolveConfig(path)).toEqual({
      contracts: [],
      out: "out.ts",
    });
  });

  test("loads config from function", async () => {
    const root = await createRoot();
    const path = join(root, "clarity.config.mjs");
    await writeFile(path, "export default () => ({ contracts: [] });");

    expect(await resolveConfig(path)).toEqual({ contracts: [] });
  });

  test("throws on unloadable config", async () => {
    const root = await createRoot();
    const path = join(root, "missing.config.mjs");

    await expect(resolveConfig(path)).rejects.toThrow(
      `Failed to load config at ${path}`,
    );
  });
});

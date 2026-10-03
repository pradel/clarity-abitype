import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, test } from "vite-plus/test";

import { findConfig } from "./findConfig.js";

async function createRoot() {
  return await mkdtemp(join(tmpdir(), "clarity-abitype-"));
}

describe("findConfig", () => {
  test("finds config in root directory", async () => {
    const root = await createRoot();
    const path = join(root, "clarity.config.ts");
    await writeFile(path, "export default {};");

    expect(await findConfig({ root })).toBe(path);
  });

  test("finds config in parent directories", async () => {
    const root = await createRoot();
    const path = join(root, "clarity.config.mjs");
    await writeFile(path, "export default {};");
    const nested = join(root, "a", "b");
    await mkdir(nested, { recursive: true });

    expect(await findConfig({ root: nested })).toBe(path);
  });

  test("resolves explicit config path", async () => {
    const root = await createRoot();
    const path = join(root, "custom.config.ts");
    await writeFile(path, "export default {};");

    expect(await findConfig({ config: "custom.config.ts", root })).toBe(path);
    expect(await findConfig({ config: "missing.config.ts", root })).toBe(
      undefined,
    );
  });

  test("returns undefined when no config is found", async () => {
    const root = await createRoot();

    expect(await findConfig({ root })).toBe(undefined);
  });
});

import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, test } from "vite-plus/test";

import { init } from "./init.js";

async function createRoot() {
  return await mkdtemp(join(tmpdir(), "clarity-abitype-"));
}

describe("init", () => {
  test("creates config file", async () => {
    const root = await createRoot();

    const path = await init({ root });

    expect(path).toBe(join(root, "clarity.config.ts"));
    const content = await readFile(path as string, "utf8");
    expect(content).toContain(
      'import { defineConfig } from "clarity-abitype/config"',
    );
    expect(content).toContain("contracts: [");
  });

  test("creates config file with provided content", async () => {
    const root = await createRoot();
    const content = {
      out: "src/abis.ts",
      contracts: [{ contract: "SP1.foo", name: "foo" }],
    };

    const path = await init({ content, root });

    const written = await readFile(path as string, "utf8");
    expect(written).toContain("defineConfig({");
    expect(written).toContain('"out": "src/abis.ts"');
  });

  test("creates config file at explicit path", async () => {
    const root = await createRoot();

    const path = await init({ config: "config/clarity.ts", root });

    expect(path).toBe(join(root, "config/clarity.ts"));
  });

  test("does not overwrite existing config", async () => {
    const root = await createRoot();
    const existing = join(root, "clarity.config.mjs");
    await writeFile(existing, "export default {};");

    const path = await init({ root });

    expect(path).toBe(existing);
    expect(await readFile(existing, "utf8")).toBe("export default {};");
  });
});

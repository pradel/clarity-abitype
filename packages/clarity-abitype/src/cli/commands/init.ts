import { mkdir, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";

import type { Config } from "../../config.js";
import * as logger from "../logger.js";
import { findConfig } from "../utils/findConfig.js";

export type Init = {
  /** Path to config file */
  config?: string;
  /** Config content */
  content?: Config;
  /** Directory to create config file in */
  root?: string;
};

export async function init(options: Init = {}) {
  const existing = await findConfig(options);
  if (existing) {
    logger.info(
      `Config already exists at ${logger.gray(relative(process.cwd(), existing))}`,
    );
    return existing;
  }

  const root = resolve(options.root ?? process.cwd());
  const outPath = options.config
    ? resolve(root, options.config)
    : resolve(root, "clarity.config.ts");

  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, getContent(options.content));
  logger.success(
    `Config created at ${logger.gray(relative(process.cwd(), outPath))}`,
  );
  return outPath;
}

function getContent(content?: Config) {
  if (content)
    return `import { defineConfig } from "clarity-abitype/config";

export default defineConfig(${JSON.stringify(content, null, 2)});
`;
  return `import { defineConfig } from "clarity-abitype/config";

export default defineConfig({
  out: "src/generated.ts",
  contracts: [
    // {
    //   name: "sbtcToken",
    //   contract: "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token",
    // },
  ],
});
`;
}

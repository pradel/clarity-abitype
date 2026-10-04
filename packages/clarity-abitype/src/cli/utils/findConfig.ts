import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";

const configFiles = [
  "clarity.config.ts",
  "clarity.config.mts",
  "clarity.config.js",
  "clarity.config.mjs",
];

export type FindConfigParameters = {
  /** Path to config file */
  config?: string;
  /** Directory to search from */
  root?: string;
};

/**
 * Resolves the path to the clarity-abitype CLI config file, searching upwards
 * from {@link FindConfigParameters.root} when no explicit path is provided.
 */
export async function findConfig(parameters: FindConfigParameters = {}) {
  const root = resolve(parameters.root ?? process.cwd());
  if (parameters.config) {
    const path = resolve(root, parameters.config);
    return existsSync(path) ? path : undefined;
  }
  let directory = root;
  while (true) {
    for (const file of configFiles) {
      const path = resolve(directory, file);
      if (existsSync(path)) return path;
    }
    const parent = dirname(directory);
    if (parent === directory) return undefined;
    directory = parent;
  }
}

import { pathToFileURL } from "node:url";

import type { Config } from "../../config.js";

/**
 * Loads and returns the config exported from {@link configPath}.
 */
export async function resolveConfig(configPath: string): Promise<Config> {
  let module: Record<string, unknown>;
  try {
    module = (await import(
      /* @vite-ignore */ pathToFileURL(configPath).href
    )) as Record<string, unknown>;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const hint = message.includes("Unknown file extension")
      ? "\nUse a .js, .mjs or .mts config, or run Node.js >= 22.18 for TypeScript configs."
      : "";
    throw new Error(
      `Failed to load config at ${configPath}.${hint}\n${message}`,
    );
  }
  let config: unknown = module.default ?? module;
  if (typeof config === "function") config = await (config as () => unknown)();
  return config as Config;
}

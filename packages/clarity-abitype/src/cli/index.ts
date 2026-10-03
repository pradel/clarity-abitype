#!/usr/bin/env node
import { createRequire } from "node:module";

import { cac } from "cac";

import { type Generate, generate } from "./commands/generate.js";
import { type Init, init } from "./commands/init.js";
import * as logger from "./logger.js";

const require = createRequire(import.meta.url);
const pkg = require("../../package.json") as { version: string };

const cli = cac("clarity-abitype");

cli
  .command("generate", "generate ABI TypeScript from configuration")
  .option("-c, --config <path>", "[string] path to config file")
  .option("-r, --root <path>", "[string] root path to resolve config from")
  .example((name) => `${name} generate`)
  .action(async (options: Generate) => {
    await generate(options);
    process.exit(0);
  });

cli
  .command("init", "create configuration file")
  .option("-c, --config <path>", "[string] path to config file")
  .option("-r, --root <path>", "[string] root path to create config file in")
  .example((name) => `${name} init`)
  .action(async (options: Init) => {
    await init(options);
    process.exit(0);
  });

cli.help();
cli.version(pkg.version);

void (async () => {
  try {
    cli.parse(process.argv, { run: false });
    if (!cli.matchedCommand) {
      if (cli.args.length === 0) {
        if (!cli.options.help && !cli.options.version) cli.outputHelp();
      } else throw new Error(`Unknown command: ${cli.args.join(" ")}`);
    }
    await cli.runMatchedCommand();
  } catch (error) {
    logger.error(`\n${(error as Error).message}`);
    process.exit(1);
  }
})();

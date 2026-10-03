import { format as utilFormat, styleText } from "node:util";

function format(args: unknown[]) {
  return utilFormat(...args);
}

export function gray(value: string) {
  return styleText("gray", value);
}

export function log(...args: unknown[]) {
  console.log(format(args));
}

export function info(...args: unknown[]) {
  console.info(styleText("blue", format(args)));
}

export function success(...args: unknown[]) {
  console.log(styleText("green", format(args)));
}

export function warn(...args: unknown[]) {
  console.warn(styleText("yellow", format(args)));
}

export function error(...args: unknown[]) {
  console.error(styleText("red", format(args)));
}

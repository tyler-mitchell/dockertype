import { stringifyArray } from "../../utils";

export function CMD(commands: string | string[]): string {
  if (Array.isArray(commands)) {
    return `CMD ${stringifyArray(commands)}`;
  }
  return `CMD ${commands}`;
}

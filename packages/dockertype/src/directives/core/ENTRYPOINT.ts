import { stringifyArray } from "../../utils";

export function ENTRYPOINT(param: string[]): string {
  return `ENTRYPOINT ${stringifyArray(param)}`;
}

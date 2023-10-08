import { stringifyArray, toArray } from "../../utils";

export function SHELL(script: string | string[]) {
  const scripts = toArray(script);

  if (Array.isArray(script)) {
    return `SHELL ${stringifyArray(scripts)}`;
  }

  return `SHELL ${scripts}`;
}

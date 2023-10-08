import { transform } from "../../utils";

export type ArgsConfig = Record<string, string | undefined>;

export function ARG({
  name,
  defaultValue,
}: {
  name?: string;
  defaultValue?: string;
}): string {
  if (!name) return "";
  return defaultValue ? `ARG ${name}=${defaultValue}` : `ARG ${name}`;
}

export function ARGS<T extends ArgsConfig>(args: T) {
  const Args = transform(args ?? {}, (key, value) => `$${key}`) as Record<
    keyof T,
    string
  >;

  const ArgDefinitions = transform(args ?? {}, (key, value) =>
    ARG({ name: key, defaultValue: value })
  );

  return {
    Args,
    ArgDefinitions,
    ARG_DEFINITIONS: Object.values(ArgDefinitions).filter(Boolean).join("\n"),
  };
}

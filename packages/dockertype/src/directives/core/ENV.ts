import { transform } from "../../utils";
export function ENV({
  key,
  value,
}: {
  key: string | undefined;
  value: string | undefined;
}): string {
  return key ? `ENV ${key}=${value}` : "";
}

export function ENVS<T extends Record<string, string>>(envs: T) {
  const EnvDefinitions = transform(envs ?? {}, (key, value) =>
    ENV({ key, value })
  );
  const Envs = transform(envs ?? {}, (key, value) => `$${key}`);
  return {
    EnvDefinitions,
    Envs,
    ENV_DEFINITIONS: Object.values(EnvDefinitions).filter(Boolean).join("\n"),
  };
}

import { directives } from "../directives";
import { KeyOf } from "../types/type-utils";
import { Args } from "../types/types";
import { StageConfig, defineStages } from "./defineStages";

export function defineDockerGenerator<
  const TCommonArgs extends Args,
  const T extends {
    stages?: StageConfig<TCommonArgs>;
    args?: { [K in string]: string | undefined };
    envs?: { [K in string]: string };
    presets?: { [K in string]: string };
  }
>(options: T) {
  const { stages, presets, args, envs } = options ?? {};

  const { ArgDefinitions, Args, ARG_DEFINITIONS } = directives.ARGS<
    NonNullable<T["args"]>
  >(args ?? {});

  const { EnvDefinitions, Envs, ENV_DEFINITIONS } = directives.ENVS<
    NonNullable<T["envs"]>
  >(envs ?? {});

  const Presets = (k: KeyOf<T["presets"]>) => {
    return presets ? presets[k] : "";
  };

  const Stage = defineStages<NonNullable<T["stages"]>>(stages ?? { as: {} });
  return {
    Stage,
    Presets,

    Envs,
    EnvDefinitions,
    ENV_DEFINITIONS,

    Args,
    ArgDefinitions,
    ARG_DEFINITIONS,

    directives,
  };
}

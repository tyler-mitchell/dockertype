import "zx/globals";
import { directives } from "../directives";
import { CommentOption, getCommentParams } from "../directives/core";
import { KeyOf } from "../types/type-utils";
import { Args } from "../types/types";

export type StageConfig<TArgs extends Args = Args> = {
  as: { [K in string]: { baseImage?: string; workdir?: string } };
  common?: {
    baseImage?: string;
    workdir?: string;
    args?: TArgs;
    envs?: { [K in string]: string };
  };
};

export type StageData = {
  fromOpt: string;
  baseImage?: string;
  workdir: string;
  DEFINE: (stageOption: StageOptions, body: (string | string[])[]) => string;
};

export type StageOptions<TAs extends string = string> = {
  as: TAs;
  comment?: CommentOption;
} & ({ baseImage?: string } | { base: TAs });

export function defineStages<T extends StageConfig>(options: T) {
  const { common, as: stageConfig } = options ?? {};

  const stages = Object.fromEntries(
    Object.entries(stageConfig).map(([name, value]) => {
      const {
        workdir: defaultWorkdir,
        baseImage: defaultBaseImage = "node:18-bullseye-slim",
      } = {
        ...common,
        ...value,
      };

      return [
        name,
        {
          workdir: defaultWorkdir,
          fromOpt: `--from=${name}`,
          DEFINE: (option, body: (string | string[])[]) => {
            const { as, comment } = option;

            const base =
              "base" in option
                ? option.base
                : (option.baseImage ?? defaultBaseImage)!;

            const commentParams = getCommentParams(
              comment ?? {
                lines: `${name.toUpperCase()} STAGE`,
              },
              {
                type: "banner",
                trailingNewline: true,
              }
            );

            const stageComment = directives.COMMENT(...commentParams);

            return `${stageComment}
            ${[
              directives.FROM({ base, as }),
              directives.WORKDIR(common?.workdir),
              directives.ARGS(common?.args ?? {}).ARG_DEFINITIONS,
              directives.ENVS(common?.envs ?? {}).ENV_DEFINITIONS,
            ]
              .filter(Boolean)
              .join("\n\n")}
          

            ${body.filter(Boolean).join("\n\n")}\n
            `;
          },
        },
      ];
    })
  ) as Record<keyof T, StageData>;

  type TAs = KeyOf<T["as"]>;

  return {
    workdir: (key: TAs, filepath?: string) => {
      const stage = stages[key];
      const workdirPath = path.join(stage.workdir, filepath ?? "");
      return workdirPath;
    },
    fromDir: (key: TAs, filepath?: string) => {
      const stage = stages[key];
      const workdirPath = path.join(stage.workdir, filepath ?? "");
      return `${stage.fromOpt} ${workdirPath}`;
    },
    Define: (stage: TAs | StageOptions<TAs>, body: (string | string[])[]) => {
      const stageOptions = (
        typeof stage === "string" ? { as: stage } : stage
      ) as StageOptions<TAs>;

      return stages[stageOptions.as].DEFINE(stageOptions, body);
    },
  };
}

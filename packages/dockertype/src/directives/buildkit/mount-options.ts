import { affixiate, recordToKeyValueString } from "../../utils";
import { DockerBuildKit } from "./mount-options.type";

export function scriptWithMountOptions(
  script: string,
  options?: DockerBuildKit.MountOptions
) {
  if (!options) return script;

  const arr = Array.isArray(options) ? options : [options];

  const mountOptionLines = arr
    .map(({ type, ...rest }, index) => {
      const line1 = affixiate(
        { prefix: "\t", active: index > 0 },
        `--mount=type=${type}`,
        { suffix: " \\" }
      );

      const linesRest = recordToKeyValueString(rest, {
        join: "\n",
        transformLine: ({ line }) => {
          return affixiate({ prefix: "\t\t" }, line, { suffix: " \\" });
        },
      });

      return `${line1}\n${linesRest}`;
    })
    .join("\n");

  const scriptLine = affixiate({ prefix: "\t" }, script);

  return [mountOptionLines, scriptLine].join("\n");
}

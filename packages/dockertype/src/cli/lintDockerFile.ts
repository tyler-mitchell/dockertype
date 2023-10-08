import { colorize } from "consola/utils";
import { logger } from "../utils/logger";

export async function lintDockerfile({
  filepath,
  strictLint: throwOnLintError,
}: {
  filepath: string;
  strictLint?: boolean;
}) {
  await $`pnpm dockerfile-utils lint ${filepath}`
    .quiet()
    .then(() => {
      logger.success("dockerfile linting passed");
    })
    .catch((e) => {
      logger.errorBox({ title: "Dockerfile lint error", message: e.stdout });

      if (throwOnLintError) {
        throw new Error(colorize("red", "The dockerfile did not pass linting"));
      }
    });
}

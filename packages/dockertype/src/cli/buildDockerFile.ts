import { withTempFile } from "../utils";
import { logger } from "../utils/logger";
import { lintDockerfile } from "./lintDockerFile";

export type BuildDockerfileOptions = {
  outputFile: string;
  lint?: boolean;
  strictLint?: boolean;
  format?: boolean;
};

export async function buildDockerfile(
  dockerfileContent: string | string[],
  options: BuildDockerfileOptions
) {
  const dockerfile = dockerfileContent;
  const {
    outputFile,

    lint: shouldLint = true,
    format: shouldFormat = true,
    strictLint = true,
  } = options;

  const content = Array.isArray(dockerfile)
    ? dockerfile.join("\n")
    : dockerfile;

  const getDockerfileContent = () =>
    withTempFile(content, async ({ tmpPath, updateTmp, readTmp }) => {
      let outputContent = content;

      if (shouldFormat) {
        const processOutput =
          await $`pnpm dockerfile-utils format ${tmpPath}`.quiet();
        const formatted = processOutput.stdout;
        outputContent = formatted;
        await updateTmp(formatted);
        logger.success("dockerfile formatted");
      }

      if (shouldLint) {
        await lintDockerfile({ filepath: tmpPath, strictLint });
      }

      return outputContent;
      // const formatted = shouldFormat
      //   ? (await $`pnpm dockerfile-utils format ${tmpPath}`).stdout
      //   : content;
    });

  try {
    const dockerfileContent = await getDockerfileContent();

    fs.outputFile(outputFile, dockerfileContent, "utf-8");

    const filename = path.basename(outputFile);

    logger.success(
      logger.colorize("green", "dockerfile build success -"),
      filename,
      logger.colorize("dim", `at ${outputFile}`)
    );
  } catch (e) {
    logger.error("Failed to build dockerfile");
    throw e;
  }
}

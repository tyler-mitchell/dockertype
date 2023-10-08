import consola from "consola";
import logger from "src/utils/logger";
import yargs from "yargs";
import "zx/globals";

export function dockertype() {
  const cli = yargs(process.argv.slice(2));

  cli.command(
    "$0 <dockergen-file-pattern> <output-dir>",
    "Path to dockergen content",
    (yargs) => {
      return yargs
        .positional("dockergen-file-pattern", {
          type: "string",
          description: "Path to dockegen file",
          demandOption: true,
        })
        .positional("output-dir", {
          type: "string",
          description: "The directory to output generated dockerfiles",
          default: "./dockergens",
          demandOption: false,
        })
        .options({
          lint: {
            type: "boolean",
            default: true,
            description: "Whether or not linting should be performed",
          },
          format: {
            type: "boolean",
            default: true,
            description: "Whether or not formatting should be performed",
          },
          strictLint: {
            type: "boolean",
            default: true,
            description: "Exits when linting fails",
          },
        });
    },
    async (args) => {
      const { dockergenFilePattern, outputDir, lint, strictLint, format } =
        args;

      const dockergenFileGlobs = await globby.globby(dockergenFilePattern);

      if (dockergenFileGlobs.length === 0) {
        logger.error(
          `No dockergen files found matching pattern: ${dockergenFilePattern}`
        );
        process.exit(0);
      }

      consola.log("FUCK");

      const promises = dockergenFileGlobs.map(async (sourceFile) => {
        const resolvedPath = path.resolve(sourceFile); //  '/Users/tylermitchell/Projects/anyteam-monorepo/infra/dockergen/templates/Nextjs-new.dockergen.ts'

        const modulePath = path.relative(__dirname, resolvedPath); // ../templates/Nextjs-new.dockergen.ts (exists)
        // const a = await $`npx tsx ${sourceFile} `;

        const a = await $`npx tsx ${sourceFile} `;

        console.log(a.stdout);
        // TypeError [ERR_UNKNOWN_FILE_EXTENSION]: Unknown file extension ".ts" for /Users/tylermitchell/Projects/anyteam-monorepo/infra/dockergen/templates/Nextjs-new.dockergen.ts
      });

      // await Promise.all(promises);
      // const promises = dockergenFileGlobs.map(async (filepath) => {
      //   console.log(`${process.cwd()}`);

      //   const content = await tsmorph.(filepath, {});

      //   console.log(filepath, content);
      //   // const fileName = path.basename(filepath);

      //   // const outputFile = path.join(outputDir, fileName);

      //   // return buildDockerfile(fileContent, {
      //   //   outputFile,
      //   //   format,
      //   //   lint,
      //   //   strictLint,
      //   // });
      // });

      await Promise.all(promises);
    }
  );

  return {
    run: () => cli.argv,
  };
}

import core from "@actions/core";
import semver from "semver";

function main() {
  console.log("HELLO")
  try {
    setEnvironmentVariables([
      {
        inputKey: "node-version",
        envKey: "NODE_VERSION",
        engineKey: "node",
      },
      {
        inputKey: "pnpm-version",
        envKey: "PNPM_VERSION",
        engineKey: "pnpm",
      },
    ]);
  } catch (e) {
    core.error(
      [
        `Unable to set environment variables from package.json`,
        e instanceof Error ? e.message : undefined,
      ]
        .filter(Boolean)
        .join("\n\n")
    );
  }
}

main();

function setEnvironmentVariables(
  versions: { inputKey: string; envKey: string; engineKey: string }[]
) {
  const { engines } = getPackageJson() ?? {};

  versions.forEach(({ inputKey, engineKey, envKey }) => {
    const inputSemver = getInputSemver(inputKey);

    if (inputSemver.isDefinedAndInvalid) {
      core.error(
        `Invalid input version format: ${inputSemver.key}: ${inputSemver.value}`
      );
    }

    const version =
      inputSemver.version ?? getMinEngineSemver({ engines, engineKey });

    if (version) {
      core.exportVariable(envKey, version);
    }
  });
}

function getInputSemver(key: string) {
  const value =
    core.getInput(key, { required: false, trimWhitespace: true }) || undefined;

  const version = semver.coerce(value)?.version;

  return {
    key,
    value,
    version,
    isDefinedAndInvalid: Boolean(value && !version),
  };
}

function getMinEngineSemver(options: { engines?: object; engineKey: string }) {
  const { engines, engineKey } = options;

  const engineVersion =
    engines && engineKey in engines
      ? `${(engines as any)[engineKey]}`
      : undefined;

  if (!engineVersion || !semver.valid(engineVersion)) return undefined;

  return semver.minVersion(engineVersion)?.version;
}

function getPackageJson() {
  try {
    const fs = require("fs");
    return JSON.parse(fs.readFileSync("./package.json", "utf8")) as Record<
      string,
      unknown
    > & {
      engines?: {
        node?: string;
        pnpm?: string;
      };
    };
  } catch {
    core.info("No package.json found");
    return undefined;
  }
}

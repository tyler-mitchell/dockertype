import { defineDockerGenerator } from "dockertype";

const args = {
  _PACKAGE_NAME: "@anyteam/js-sdk",
  _PACKAGE_DIR: "apps/sdk",
  _DOPPLER_ENV: undefined,
  _DOPPLER_TOKEN: undefined,
  _NEXTAUTH_URL: undefined,
};

const ENABLE_PNPM = "corepack enable";

const INSTALL_DOPPLER_CLI = `apt-get update && apt-get install -y apt-transport-https ca-certificates curl gnupg && \
    curl -sLf --retry 3 --tlsv1.2 --proto "=https" 'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key' | apt-key add - && \
    echo "deb https://packages.doppler.com/public/cli/deb/debian any-version main" | tee /etc/apt/sources.list.d/doppler-cli.list && \
    apt-get update && \
    apt-get -y install doppler`;

const {
  Stage,
  Args,
  Envs,
  EnvDefinitions,
  directives: { RUN, ADD, COPY, CMD, USER, EXPOSE, COMMENT },
} = defineDockerGenerator({
  stages: {
    as: {
      base: {},
      build: {},
      scaffold: {},
      runner: {},
    },
    common: {
      baseImage: "node:18-alpine",
      workdir: "/app",
      args: args,
    },
  },
  args,
  envs: {
    PORT: "3000",
    PNPM_HOME: "/pnpm",
    PATH: "$PNPM_HOME:$PATH",
  },
});

export default [
  Stage.Define(
    {
      as: "base",
      baseImage: "node:18-alpine",
      comment: "Setup Base",
    },
    [RUN("corepack enable")]
  ),
  Stage.Define(
    {
      as: "scaffold",
      comment: "Stage 1: Isolate the target package and its dependencies",
      base: "base",
    },
    [
      COPY({ from: ".", to: "." }),

      COMMENT(
        "Use turbo cli to isolate the target app from its unused dependencies"
      ),
      RUN("npm install npm@latest --global"),
      RUN("npm install turbo --global"),
      RUN(`turbo prune --scope=${Args._PACKAGE_NAME} --docker`),
    ]
  ),

  Stage.Define(
    {
      as: "build",

      comment: "Stage 2: Build the target package",
    },
    [
      COMMENT("Enable PNPM via Corepack"),
      RUN(ENABLE_PNPM),

      COMMENT(["Copy pnpm-lock.yaml and full/* directory from previous stage"]),
      COPY([
        {
          from: Stage.fromDir("scaffold", "out/pnpm-lock.yaml"),
          to: ".",
        },
        {
          from: Stage.fromDir("scaffold", "out/full/"),
          to: ".",
        },
      ]),

      COMMENT("Install dependencies and build"),
      RUN("pnpm install"),
      RUN(`pnpm build --filter=${Args._PACKAGE_NAME}...`),
    ]
  ),

  Stage.Define(
    {
      as: "runner",
      // base: "turbo",
      comment: "Stage 3: Run the target package",
    },
    [
      COPY({ from: Stage.fromDir("build"), to: "." }),

      COMMENT("Install Doppler CLI"),
      // RUN(INSTALL_DOPPLER_CLI),

      COMMENT("Enable PNPM via Corepack"),
      RUN(ENABLE_PNPM),

      COMMENT("Create permissions for appuser"),
      RUN("addgroup --system --gid 1001 appgroup"),
      RUN("adduser --system --gid 1001 --home /home/appuser appuser"),
      RUN("chown -R appuser:appgroup /home/appuser"),
      RUN("chown -R appuser:appgroup /app"),
      USER("appuser"),

      COMMENT("Define port and expose it"),
      EnvDefinitions.PORT,
      EXPOSE(Envs.PORT),

      COMMENT("Run the app"),
      CMD("pnpm dev --filter=@anyteam/js-sdk..."),
    ]
  ),
];

import { defineDockerGenerator } from "dockertype";

// TESTING
const args = {
  _PACKAGE_NAME: "@anyteam/js-sdk",
  _PACKAGE_DIR: "apps/sdk",
  _DOPPLER_ENV: undefined,
  _DOPPLER_TOKEN: undefined,
  _NEXTAUTH_URL: undefined,
};

const ENABLE_PNPM = "corepack enable";

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
      installer: {},
      builder: {},
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
    [RUN("corepack enable"), RUN("npm install turbo --global")]
  ),
  Stage.Define(
    {
      as: "builder",
      comment: "Stage 1: Scaffold",
      base: "base",
    },

    [
      RUN("apk add --no-cache libc6-compat"),
      RUN("apk update"),
      COPY([{ from: ".", to: "./" }]),
      RUN("turbo prune --scope=web --docker"),
    ]
  ),

  Stage.Define(
    {
      as: "installer",
      base: "builder",
      comment: "Stage 2: Installer",
    },
    [
      COMMENT(" First install the dependencies (as they change less often)"),

      RUN("pnpm install --frozen-lockfile", {
        mountOptions: [
          {
            type: "secret",
            id: "env",
            target: "/workspace/.env",
          },
          {
            type: "cache",
            target: "/workspace/node_modules/.cache",
          },
        ],
      }),

      COPY([
        { from: ".gitignore", to: ".gitignore" },
        { from: Stage.fromDir("builder"), to: "." },
        { from: Stage.fromDir("builder"), to: "./pnpm-lock.yaml" },
        { from: Stage.fromDir("builder"), to: "./pnpm-workspace.yaml" },
      ]),

      RUN("pnpm install"),

      COPY(`${Stage.fromDir("builder")} /app/out/full/ ./`),
      COPY(`turbo.json turbo.json`),
      RUN("turbo run build --filter=web"),
    ]
  ),

  Stage.Define(
    {
      as: "runner",
      baseImage: "alpine",
      comment: "Stage 3: Run the target package",
    },
    [
      RUN("addgroup --system --gid 1001 nodejs"),
      RUN("adduser --system --uid 1001 nextjs"),
      USER("pnpm dev"),
    ]
  ),
];

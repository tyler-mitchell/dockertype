import { defineDockerGenerator } from "dockertype";
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
    },
  },

  envs: {
    PORT: "3000",
    PNPM_HOME: "/pnpm",
    PATH: "$PNPM_HOME:$PATH",
  },
});

export default [];

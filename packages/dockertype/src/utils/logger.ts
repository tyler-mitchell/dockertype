import consola, { createConsola } from "consola";
import {} from "consola/core";
import { colorize } from "consola/utils";

export type { Consola, ConsolaInstance, LogLevel } from "consola";

function errorBox({ title, message }: { title: string; message: string }) {
  consola.box({
    title: colorize("red", ` ${title} `),
    message,
    style: {
      padding: 1,
      borderStyle: "double-single-rounded",
    },
  });
}

export const logger = { ...createConsola(), colorize, errorBox };

export default logger;

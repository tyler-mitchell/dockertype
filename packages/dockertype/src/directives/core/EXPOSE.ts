import { affixiate } from "../../utils";

export function EXPOSE(input: string | { port: string; protocol?: string }) {
  const { port, protocol } =
    typeof input === "string" ? { port: input, protocol: undefined } : input;

  return affixiate(`EXPOSE ${port}`, {
    suffix: `/${protocol}`,
    active: Boolean(protocol),
  });
}

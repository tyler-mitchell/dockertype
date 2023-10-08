import { affixiate } from "../../utils";

export function MAINTAINER(
  personInfo: string | { name: string; email?: string }
): string {
  if (typeof personInfo === "string") {
    return `MAINTAINER ${personInfo}`;
  }
  const { name, email } = personInfo;

  return affixiate(`MAINTAINER ${name}`, {
    suffix: `\s<${email}>`,
    active: Boolean(email),
  });
}

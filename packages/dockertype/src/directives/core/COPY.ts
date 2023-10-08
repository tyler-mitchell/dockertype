export type COPYOptions = {
  from: string;
  to: string;
  options?: string;
};

export function COPY(opt: string | COPYOptions | COPYOptions[]): string {
  if (typeof opt === "string") return `COPY ${opt}`;

  const optList = Array.isArray(opt) ? opt : [opt];

  return optList
    .map(({ from, to, options }) => {
      return options ? `COPY ${options} ${from} ${to}` : `COPY ${from} ${to}`;
    })
    .join("\n\n");
}

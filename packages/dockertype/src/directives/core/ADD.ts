export function ADD({ from, to }: { from: string; to: string }): string {
  return `ADD ${from} ${to}`;
}

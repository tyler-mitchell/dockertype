export function FROM({ base, as }: { base: string; as?: string }): string {
  return as ? `FROM ${base} AS ${as}` : `FROM ${base}`;
}

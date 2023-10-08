export function VAR(name: string, defaultValue?: string): string {
  return defaultValue !== undefined
    ? `\${${name}:-"${defaultValue}"}`
    : `\${${name}}`;
}

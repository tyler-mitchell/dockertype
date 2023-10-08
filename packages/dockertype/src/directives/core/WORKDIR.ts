export function WORKDIR(directory?: string): string {
  return directory ? `WORKDIR ${directory}` : "";
}

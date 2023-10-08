export function ONBUILD(instruction: string | string[]) {
  if (Array.isArray(instruction)) {
    return instruction.join("\n");
  }

  return instruction;
}

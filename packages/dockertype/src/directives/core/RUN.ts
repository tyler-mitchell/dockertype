import { scriptWithMountOptions } from "../buildkit";
import { DockerBuildKit } from "../buildkit/mount-options.type";

interface RunOptions {
  /**
   * `mountOptions` is a union type that represents the various mounting options available in Docker BuildKit.
   *
   * Docker BuildKit mounting provides the ability to temporarily attach external resources like file systems or data during
   * the container image build process. These mounts are ephemeral and do not affect the final container image.
   *
   * ### Execution Phases:
   * 1. **Instruction Read**: When a `RUN` instruction containing a `--mount` flag is encountered, Docker identifies the type of mount and its parameters.
   *
   * 2. **Initialization**: Depending on the mount type, Docker performs the necessary initialization steps, such as allocating memory or identifying host paths.
   *
   * 3. **Execution**: The `RUN` command is executed with the mount active, allowing the build process to read from or write to the mount based on its type and permissions.
   *
   * 4. **Isolation**: Each mount is scoped to its specific `RUN` command, ensuring that its effects are isolated to that part of the build.
   *
   * 5. **Finalization**: Once the `RUN` command completes, the mount is disengaged and any temporary data can be discarded or saved, based on the mount type.
   *
   * 6. **Cleanup**: Docker performs any necessary cleanup operations, like releasing resources used by the mount.
   *
   */
  mountOptions: DockerBuildKit.MountOptions;
}

export function RUN(runScript: string, options?: RunOptions): string {
  const { mountOptions } = options ?? {};

  const runLine = scriptWithMountOptions(runScript, mountOptions);

  return `RUN ${runLine}`;
}

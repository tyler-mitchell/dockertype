export namespace DockerBuildKit {
  export type MountOptions = MountOption | MountOption[];

  export type MountOption =
    | DockerBuildKit.BindMountOption
    | DockerBuildKit.VolumeMountOption
    | DockerBuildKit.TmpfsMountOption
    | DockerBuildKit.CacheMountOption
    | DockerBuildKit.SshMountOption
    | DockerBuildKit.SecretMountOption
    | DockerBuildKit.NamedMountOption;

  export interface BindMountOption {
    /**
     * Represents a bind mount option that mounts a path from the host into a container.
     * Use this when you need to make specific files or directories on your host system available within the container.
     * It allows for direct access to host files during the build process.
     */
    type: "bind";

    /**
     * The source path on the host system that will be bind-mounted into the container.
     */
    src: string;

    /**
     * The target path within the container where the source path will be mounted.
     */
    target: string;

    /**
     * Optional. Specifies whether the mount should be read-only. If set to `true`, the container cannot write to this mount.
     */
    readonly?: boolean;
  }

  export interface VolumeMountOption {
    /**
     * Represents a volume mount option that mounts a named volume into a container.
     * Use this when you want to manage and persist data separately from the container.
     * Volumes provide data persistence and can be shared among containers.
     */
    type: "volume";

    /**
     * The name of the volume that will be mounted into the container.
     */
    src: string;

    /**
     * The target path within the container where the volume will be mounted.
     */
    target: string;

    /**
     * Optional. Specifies whether the mount should be read-only. If set to `true`, the container cannot write to this mount.
     */
    readonly?: boolean;
  }

  export interface TmpfsMountOption {
    /**
     * Represents a tmpfs mount option that creates an in-memory filesystem within a container.
     * Use this when you need a temporary filesystem that exists only in memory.
     * It is useful for applications that require a fast and volatile storage space.
     */
    type: "tmpfs";

    /**
     * The target path within the container where the tmpfs filesystem will be mounted.
     */
    target: string;
  }

  export interface CacheMountOption {
    /**
     * Represents a cache mount option that allows caching build artifacts for reuse.
     * Use this when you want to optimize your build process by caching intermediate build results.
     * It can significantly reduce build times by reusing cached layers.
     */
    type: "cache";

    /**
     * Optional. A unique identifier for the cache mount. If not provided, a default identifier will be generated.
     */
    id?: string;

    /**
     * The target path within the container where the cache will be mounted.
     */
    target: string;
  }

  export interface SshMountOption {
    /**
     * Represents an SSH mount option that enables SSH agent forwarding into a container.
     * Use this when your containerized application needs to access SSH keys and securely connect to remote resources.
     * It allows the container to utilize SSH agent forwarding.
     */
    type: "ssh";
  }

  export interface SecretMountOption {
    /**
     * Represents a secret mount option that allows access to secrets within a container.
     * Use this when you need to securely pass sensitive information, such as credentials or API keys, to a container.
     * Secrets are typically stored outside the container and mounted as needed.
     */
    type: "secret";

    /**
     * A unique identifier for the secret. This identifier is used to access the secret within the container.
     */
    id: string;

    /**
     * The target path within the container where the secret will be available.
     */
    target: string;
  }

  export interface NamedMountOption {
    /**
     * Represents a named mount option that provides access to external resources within a container.
     * Use this when you want to make external resources available within the container, such as network shares or other containers.
     * Named mounts allow for flexible integration with external dependencies.
     */
    type: "named";

    /**
     * The target path within the container where the named mount will be available.
     */
    target: string;
  }
}

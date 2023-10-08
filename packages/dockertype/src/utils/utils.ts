import { KeyOf, ValueOf } from "../types/type-utils";

export function transform<T extends Record<string, unknown>>(
  obj: T,
  cb: (key: KeyOf<T>, value: ValueOf<T>) => string
) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key,
      cb(key as any, value as any),
    ])
  ) as { [K in KeyOf<T>]: string };
}

export async function withTempFile<TReturn>(
  content: string,
  cb: (props: {
    tmpPath: string;
    tmpDir: string;
    readTmp: () => Promise<string>;
    updateTmp: (content: string) => Promise<void>;
  }) => TReturn,
  options?: { tmpFilename?: string; tmpDirname?: string }
) {
  const now = `${Date.now()}`;

  const defaultDirname = `with-temp-file-${now}` || now;

  const { tmpDirname = `${defaultDirname}`, tmpFilename = `tempfile_${now}` } =
    options ?? {};

  const tmpDir = path.join(os.tmpdir(), tmpDirname);

  const tmpPath = path.join(tmpDir, tmpFilename);

  await fs.outputFile(tmpPath, content, "utf-8");

  const res = await cb({
    tmpPath,
    tmpDir,
    readTmp: () => fs.readFile(tmpPath, "utf-8"),
    updateTmp: (content) => fs.outputFile(tmpPath, content, "utf-8"),
  });

  await fs.remove(tmpDir);

  return res;
}

type TransformLineProps = {
  key: string;
  value: KValue;
  line: string;
  index: number;
};

export function recordToKeyValueString<
  TJoin extends string | undefined = undefined,
>(
  kvObject: Record<string, KValue>,
  options?: {
    kvDelimeter?: string;
    join?: TJoin;
    transformLine?: (props: TransformLineProps) => string;
  }
): TJoin extends string ? string : Array<string> {
  const {
    kvDelimeter,
    join = false,
    transformLine = (props: TransformLineProps) => props.line,
  } = options ?? {};

  const lines = Object.entries(kvObject).map(([key, value], index) => {
    const line = keyValString({
      key,
      value,
      kvDelimeter,
    });
    return transformLine({ key, value, line, index });
  });

  const result = typeof join === "string" ? lines.join(join) : lines;

  return result as never;
}

type Char = "break" | "continuation" | "comma" | "space" | "tab" | "none";

type KValue = string | number | boolean | undefined;

export function flagOpt({ key, value }: { key: string; value: string }) {
  return `--${key}=${value}`;
}

type KeyValStringOptions = {
  key: string;
  value: KValue;
  kvDelimeter?: string;
};

export function keyValString(options: KeyValStringOptions) {
  const { key, value, kvDelimeter } = options;

  if (!key || !value) return "";

  const keyval = [key, value].join(kvDelimeter ?? "=");

  return getAffixiatedString({ str: keyval });
}

export function affixiate(...params: AffixParams): string {
  return getAffixiatedString(parseAffixParams(params));
}

interface Prefix extends BaseAffix {
  prefix: string;
}

interface Suffix extends BaseAffix {
  suffix: string;
}

type BaseAffix = {
  count?: number;
  active?: boolean;
};

interface Affix extends BaseAffix {
  affix: string;
  type: "prefix" | "suffix";
}

type AffixParams =
  | [prefix: Prefix, str: string, suffix: Suffix]
  | [prefix: Prefix, str: string]
  | [str: string, suffix: Suffix];

function isPrefix(arg: unknown): arg is Prefix {
  return Boolean(arg && typeof arg === "object" && "prefix" in arg);
}

function isSuffix(arg: unknown): arg is Suffix {
  return Boolean(arg && typeof arg === "object" && "suffix" in arg);
}

function parseAffixParams(params: AffixParams) {
  return params.reduce(
    (acc, cur) => {
      if (typeof cur === "string") {
        acc.str = cur;
      }

      if (isPrefix(cur)) {
        const { prefix, ...rest } = cur;
        acc.affixiation.push({ type: "prefix", affix: prefix, ...rest });
      }

      if (isSuffix(cur)) {
        const { suffix, ...rest } = cur;
        acc.affixiation.push({ type: "suffix", affix: suffix, ...rest });
      }

      return acc;
    },
    { str: "", affixiation: [] } as { str: string; affixiation: Affix[] }
  );
}

function getAffixiatedString({
  str,
  affixiation = [],
}: {
  str: string;
  affixiation?: Affix | Affix[];
}) {
  const affixes = toArray(affixiation);

  const reduced = affixes.reduce(
    (acc, cur) => {
      const { affix, type, active = true, count = 1 } = cur;

      if (!active) return acc;

      acc[type] += repeat(affix, count) ?? "";

      return acc;
    },
    { prefix: "", suffix: "" }
  );

  const { prefix, suffix } = reduced;

  return `${prefix}${str}${suffix}`;
}

function repeat(str: string | undefined, factor: unknown) {
  if (!str) return "";
  const count = coerceToRepeatCount(factor);
  return str.repeat(count);
}

function coerceToRepeatCount(input?: unknown): number {
  if (typeof input === "number") return input;
  if (typeof input === "boolean") return input ? 1 : 0;
  return 0;
}

export function stringifyArray(arr: string[]) {
  return `${arr.map((e) => `["${e}"]`).join(", ")}`;
}

export function toArray<T>(input: T | T[]): T[] {
  return Array.isArray(input) ? input : [input];
}

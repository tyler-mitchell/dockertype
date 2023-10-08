export type COMMENTOptions = {
  type?: CommentType;
  trailingNewline?: NewlineOption;
  leadingNewline?: NewlineOption;
};

type NewlineOption = boolean | number;

export function COMMENT(
  comment: string | string[],
  options?: COMMENTOptions
): string {
  const {
    type: commentType,
    leadingNewline = false,
    trailingNewline = false,
  } = options ?? {};

  const comments = Array.isArray(comment) ? comment : comment.split("\n");

  const commentLines = comments.map((line) => `# ${line}`).join("\n");

  const commentString = commentType
    ? commentStyles[commentType](commentLines)
    : commentLines;

  const leadingNl = newline(leadingNewline);

  const trailingNl = newline(trailingNewline);

  return [leadingNl, commentString, trailingNl].join("");
}

function newline(option?: NewlineOption) {
  if (!option) return "";
  const newLineCount = typeof option === "boolean" ? (option ? 1 : 0) : option;
  return newLineCount > 0 ? "\n".repeat(newLineCount) : "";
}

export type CommentType =
  | "singleLine"
  | "banner"
  | "minimal"
  | "titledSingle"
  | "doubleLine"
  | "titledBox"
  | "threeLine"
  | "dashed"
  | "arrowed"
  | "capital"
  | "spaceHeader"
  | "mixedSymbol";

export const commentStyles: Record<CommentType, (comment: string) => string> = {
  singleLine: (c) => `# ${c}`,
  banner: (c) =>
    `###################################################################################################\n${c}\n###################################################################################################`,
  minimal: (c) =>
    `# ======================================\n${c}\n# ======================================`,
  titledSingle: (c) => `# ------------ ${c} ------------`,
  doubleLine: (c) => `##\n${c}\n##`,
  titledBox: (c) => `##################\n${c}\n##################`,
  threeLine: (c) => `#\n${c}\n#`,
  dashed: (c) =>
    `# ----------------------------------------\n${c}\n# ----------------------------------------`,
  arrowed: (c) => `# >>>>>>>>>>>>>>> ${c} <<<<<<<<<<<<<<<<`,
  capital: (c) => `# ${c.toUpperCase()}`,
  spaceHeader: (c) => `# \n${c}\n# `,
  mixedSymbol: (c) => `# ======== ${c} ========`,
};

export type CommentOption =
  | null
  | string
  | string[]
  | (COMMENTOptions & {
      lines?: string | string[];
    });

export function getCommentParams(
  comment: CommentOption,
  defaultOptions?: COMMENTOptions
): readonly [commentLines: string | string[], commentOptions?: COMMENTOptions] {
  if (comment === null) {
    return [""];
  }

  if (typeof comment === "string") {
    return [comment, defaultOptions];
  }

  if (Array.isArray(comment)) {
    return [comment.join("\n"), defaultOptions];
  }

  const { lines, ...rest } = { ...defaultOptions, ...comment };

  if (!lines) return [""];

  return [lines, rest];
}

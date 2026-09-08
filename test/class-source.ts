// Shared source-scanning helpers for the two style guards
// (tailwind-classes.test.ts and focus-visible.test.ts).
//
// Extracted after a mutation test caught a hole: both guards originally scanned
// line by line, and a class string written as a multi-line template literal —
//
//   className={`bg-paperRaised border border-hair shadow-2xs
//     rounded-xl ${extra}`}
//
// — has only ONE backtick on its opening line, so the "quoted run" regex never
// matched and none of its classes were checked. Card.tsx, Sidebar.tsx and every
// other component that builds a conditional className this way were invisible.
// Scanning whole files and deriving line numbers from offsets fixes it.
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

/**
 * Comments in this repo quote class names in backticks — `shadow-2xs`,
 * `focus:ring-*` — precisely because those are the names under discussion, and
 * a backtick run otherwise reads as a template literal.
 *
 * `//` is only stripped when not preceded by `:`, so the `//` in an `https://`
 * URL does not truncate the rest of the line.
 */
export function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

export function tsxFiles(dir: string): string[] {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full, { withFileTypes: true }).flatMap((entry) => {
    const p = path.join(dir, entry.name);
    return entry.isDirectory() ? tsxFiles(p) : p.endsWith(".tsx") ? [p] : [];
  });
}

export type StringLiteral = {
  /** Literal body, without the surrounding quotes. */
  body: string;
  /** 1-indexed line the literal starts on. */
  line: number;
};

/**
 * Every string literal in a source file, comments removed.
 *
 * Template literals may span lines; single- and double-quoted strings may not,
 * which keeps an unbalanced apostrophe in prose from swallowing the rest of the
 * file.
 */
export function stringLiterals(source: string): StringLiteral[] {
  const cleaned = stripComments(source);
  const literals: StringLiteral[] = [];
  const pattern = /`[^`]*`|"[^"\n]*"|'[^'\n]*'/g;

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(cleaned)) !== null) {
    const before = cleaned.slice(0, match.index);
    literals.push({
      body: match[0].slice(1, -1),
      line: before.split("\n").length,
    });
  }

  return literals;
}

/**
 * Splits a template body on `${...}` holes, counting braces so a hole
 * containing a NESTED template literal is consumed whole.
 *
 * A `[^}]*` pattern stops at the first `}` it sees, so
 *
 *   `... ${open ? "a" : `b ${side === "l" ? "c" : "d"}`} ...`
 *
 * ended mid-expression and the remainder was tokenised as if it were static
 * class text, emitting garbage like `translate-x-0"` — a class that does not
 * exist, reported at a line where nothing is wrong. False alarms are how a
 * guard loses its authority, so the scanner has to understand nesting.
 */
function splitOnHoles(body: string): string[] {
  const segments: string[] = [];
  let segment = "";

  for (let i = 0; i < body.length; i += 1) {
    if (body[i] === "$" && body[i + 1] === "{") {
      let depth = 1;
      let j = i + 2;
      while (j < body.length && depth > 0) {
        if (body[j] === "{") depth += 1;
        else if (body[j] === "}") depth -= 1;
        j += 1;
      }
      segments.push(segment);
      segment = "";
      i = j - 1;
      continue;
    }
    segment += body[i];
  }

  segments.push(segment);
  return segments;
}

/**
 * Whole class tokens inside one string literal body.
 *
 * A template literal's static text is still literal class names, so skipping
 * every literal containing `${` would miss real defects — `animate-slideUp` and
 * `py-0.2` both sat beside an interpolation hole. Splitting on the holes and
 * dropping only the token touching each boundary keeps those while discarding
 * genuine fragments such as the `bg-` of `bg-${tone}-500`.
 */
export function classTokens(body: string): string[] {
  const segments = splitOnHoles(body);
  const tokens: string[] = [];

  segments.forEach((segment, index) => {
    const parts = segment.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return;
    const startsGlued = index > 0 && !/^\s/.test(segment);
    const endsGlued = index < segments.length - 1 && !/\s$/.test(segment);
    tokens.push(...parts.slice(startsGlued ? 1 : 0, endsGlued ? -1 : undefined));
  });

  return tokens;
}

export function readSource(file: string): string {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}

// @vitest-environment node
//
// The guard that UI-AUDIT-1 said was missing.
//
// test/tailwind-colors.test.ts proves that DEFINED tokens compile to real CSS.
// It never asked whether the classes the app actually USES resolve, so seven
// dead utilities and an undefined `accent` colour shipped unnoticed: Tailwind
// v4 names (`shadow-2xs`, `shadow-xs`, `backdrop-blur-xs`) against the pinned
// v3.4.4, animations with no keyframes, a `no-scrollbar` that was never
// defined, and `bg-accent`/`text-accent`/`border-accent` against a colour that
// exists in neither the project config nor Tailwind's default palette.
//
// Every one of those degrades to silence: nothing errors, TypeScript passes,
// the suite stays green, and the UI quietly renders wrong.
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import postcss from "postcss";
import tailwindcss from "tailwindcss";
import { classTokens, readSource, stringLiterals, tsxFiles } from "./class-source";

const ROOT = process.cwd();

/**
 * Decodes a CSS-escaped identifier back to the class name an author writes.
 *
 * Two escape forms appear in Tailwind's output and they decode differently.
 * A simple `\:` or `\[` is just the next character. A comma inside an
 * arbitrary value becomes the hex form `\2c ` — six hex digits max, with an
 * optional trailing space that is a delimiter rather than content. Stripping
 * backslashes naively turns `minmax(7.5rem\2c 0.85fr)` into
 * `minmax(7.5rem2c 0.85fr)` and every arbitrary value containing a comma looks
 * dead.
 */
function decodeCssIdentifier(escaped: string): string {
  return escaped.replace(/\\(?:([0-9a-fA-F]{1,6})[ ]?|(.))/g, (_all, hex, literal) =>
    hex ? String.fromCodePoint(Number.parseInt(hex, 16)) : literal,
  );
}

/**
 * Class names Tailwind actually emitted, decoded.
 *
 * `.hover\:bg-ink\/90:hover` yields `hover:bg-ink/90` — the capture stops at
 * the unescaped `:` that begins the pseudo-class, so variants stay part of the
 * name and pseudo-selectors do not. Arbitrary values survive the same way:
 * `.w-\[1800px\]` yields `w-[1800px]`.
 */
async function generatedClassNames(): Promise<Set<string>> {
  const globals = fs.readFileSync(path.join(ROOT, "app/globals.css"), "utf8");
  const result = await postcss([
    tailwindcss(path.join(ROOT, "tailwind.config.js")),
  ]).process(globals, { from: path.join(ROOT, "app/globals.css") });

  const names = new Set<string>();
  const selector = /\.((?:[-a-zA-Z0-9_]|\\[0-9a-fA-F]{1,6}[ ]?|\\.)+)/g;
  for (const match of result.css.matchAll(selector)) {
    names.add(decodeCssIdentifier(match[1]));
  }
  return names;
}

/**
 * Utility roots this project uses. A source token counts as a class candidate
 * when it equals a root or begins with `<root>-`, which is what keeps prose and
 * non-class strings such as `en-IN`, `2-digit` and the word "growth" out of the
 * check — matching on a bare prefix would flag "growth" for starting with
 * "grow".
 *
 * A token that IS a real utility but whose root is missing here is simply not
 * checked: the guard under-reports rather than false-alarms. Add roots as the
 * project grows.
 */
const UTILITY_ROOTS = [
  "bg", "text", "border", "divide", "outline", "ring", "shadow",
  "rounded", "opacity", "backdrop", "mix-blend", "fill", "stroke",
  "p", "px", "py", "pt", "pb", "pl", "pr", "ps", "pe",
  "m", "mx", "my", "mt", "mb", "ml", "mr", "space",
  "w", "h", "min-w", "min-h", "max-w", "max-h", "size",
  "flex", "grid", "gap", "col", "row", "order", "basis", "grow", "shrink",
  "items", "justify", "content", "self", "place",
  "font", "leading", "tracking", "align", "whitespace", "break",
  "line-clamp", "list", "indent", "decoration", "underline-offset",
  "top", "bottom", "left", "right", "inset", "z",
  "transition", "duration", "delay", "ease", "animate",
  "scale", "rotate", "translate", "skew", "transform", "origin",
  "cursor", "select", "pointer-events", "resize", "appearance",
  "overflow", "overscroll", "object", "aspect",
  "table", "caption", "columns",
];

/**
 * Utilities that are legal on their own, with no value suffix.
 *
 * The distinction matters: `bottom`, `left`, `order`, `object`, `my` and `text`
 * are roots that always take a value, so a bare occurrence is a prop value
 * (`side="bottom"`, `type="text"`) rather than a class. Treating every root as
 * standalone flagged eight of those.
 *
 * Listing a genuine standalone utility here is harmless even if it also appears
 * as a prop value, because Tailwind's own extractor sees it in the same source
 * and emits a rule for it, so it resolves.
 */
const STANDALONE_UTILITIES = new Set([
  "border", "ring", "shadow", "rounded", "outline", "divide",
  "transition", "transform", "grow", "shrink", "resize", "isolate",
  "flex", "grid", "contents", "flow-root", "columns", "table",
  "hidden", "block", "inline", "inline-block", "inline-flex", "inline-grid",
  "absolute", "relative", "fixed", "sticky", "static",
  "visible", "invisible", "collapse", "truncate",
  "italic", "not-italic", "underline", "overline", "line-through", "no-underline",
  "uppercase", "lowercase", "capitalize", "normal-case",
  "antialiased", "subpixel-antialiased", "sr-only", "not-sr-only",
  "tabular-nums", "proportional-nums", "diagonal-fractions", "slashed-zero",
]);

/**
 * Classes defined by this project rather than by Tailwind. Each must exist in
 * the compiled stylesheet, and each is exempt from the prefix filter above.
 */
const PROJECT_CLASSES = [
  "prose-gazette",
  "font-telugu",
  "font-mono",
  "print-page-break",
  "no-scrollbar",
  // Marks a letterhead panel so the focus ring switches to the dark-ground
  // colour. The masthead pair does not flip between themes, so this is not
  // something `html.dark` can express.
  "on-masthead",
  "text-display",
  "text-section",
  "text-card-title",
  "text-body",
  "text-meta",
  "text-telugu-title",
  "text-telugu-body",
];

/** Not classes: React/JSX and DOM identifiers that share the attribute space. */
const NOT_CLASSES = new Set(["group", "peer", "dark", "light"]);

function isClassCandidate(token: string): boolean {
  if (NOT_CLASSES.has(token)) return false;

  // An arbitrary value may legally contain quotes — `font-['Arial',sans-serif]`
  // — which the literal scanner splits on, leaving the fragment `font-[`.
  // Unbalanced brackets mean we are looking at half a class, not a dead one.
  const opens = (token.match(/\[/g) ?? []).length;
  const closes = (token.match(/\]/g) ?? []).length;
  if (opens !== closes) return false;

  const base = token.includes(":") ? token.slice(token.lastIndexOf(":") + 1) : token;
  const bare = base.replace(/^!/, "").replace(/^-/, "");
  if (PROJECT_CLASSES.includes(bare)) return true;
  if (STANDALONE_UTILITIES.has(bare)) return true;
  return UTILITY_ROOTS.some((root) => bare.startsWith(`${root}-`));
}

/**
 * Class tokens used in app source, with the file:line each came from.
 *
 * Scans every string literal, not just `className="..."`, because the defects
 * that shipped lived in conditional template-literal branches
 * (`isActive ? "bg-accent/15 ..." : "..."`) and in variant lookup maps such as
 * Badge's VARIANT_MAP — neither of which is a className attribute.
 */
function usedClasses(): Map<string, string[]> {
  const used = new Map<string, string[]>();

  for (const file of tsxFiles("app")) {
    for (const literal of stringLiterals(readSource(file))) {
      for (const token of classTokens(literal.body)) {
        if (!isClassCandidate(token)) continue;
        if (!used.has(token)) used.set(token, []);
        used.get(token)!.push(`${file}:${literal.line}`);
      }
    }
  }

  return used;
}

describe("Tailwind classes used by the app", () => {
  it("every utility class used in app source compiles to real CSS", async () => {
    const generated = await generatedClassNames();

    const dead = [...usedClasses().entries()]
      .filter(([token]) => !generated.has(token))
      .map(([token, locations]) => `${token} (${locations.length}x) e.g. ${locations[0]}`)
      .sort();

    expect(dead).toEqual([]);
  });

  it("every project-defined class exists in the compiled stylesheet", async () => {
    const generated = await generatedClassNames();

    const undefinedClasses = PROJECT_CLASSES.filter((name) => !generated.has(name));

    expect(undefinedClasses).toEqual([]);
  });

  it("has no `accent` colour utility, which is not a project token", async () => {
    const generated = await generatedClassNames();

    // Retired in UI-DESIGN-1: AGENTS.md fixes a closed token set, and
    // navigation position is chrome that must not borrow a document-status
    // colour. Re-adding `accent` to tailwind.config.js would make this pass
    // again, so the source check below is the load-bearing half.
    expect([...generated].filter((name) => /(^|:)(bg|text|border)-accent/.test(name))).toEqual([]);

    const offenders: string[] = [];
    for (const file of tsxFiles("app")) {
      const lines = fs.readFileSync(path.join(ROOT, file), "utf8").split("\n");
      lines.forEach((line, index) => {
        if (/\b(bg|text|border|ring|from|to|via)-accent\b/.test(line)) {
          offenders.push(`${file}:${index + 1}`);
        }
      });
    }

    expect(offenders).toEqual([]);
  });
});

// @vitest-environment node
//
// UI-AUDIT-1 found that no form control in the product had a visible focus
// indicator, and that test/a11y.test.ts did not notice. Two independent
// mechanisms defeated it, so this file checks both — a test that only covered
// one would go green while keyboard users still had nothing to see.
//
// 1. `.outline-none` (a Tailwind utility, specificity (0,1,0)) cancelled the
//    global `:where(...):focus-visible` outline, which ALSO had specificity
//    (0,1,0) because :where() contributes none — and lost on source order,
//    since utilities are emitted after @layer base.
//
// 2. The replacement, `focus:ring-tamarind/20`, set --tw-ring-color but no ring
//    WIDTH, so --tw-ring-shadow stayed at its `0 0 #0000` initial value and no
//    ring painted.
//
// The existing guard matched `focus:outline-none` and therefore never saw the
// bare `outline-none` that Input and NativeSelect actually used.
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import postcss from "postcss";
import tailwindcss from "tailwindcss";

const ROOT = process.cwd();

/** Comments in this repo quote class names in backticks; they are prose. */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

function tsxFiles(dir: string): string[] {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full, { withFileTypes: true }).flatMap((entry) => {
    const p = path.join(dir, entry.name);
    return entry.isDirectory() ? tsxFiles(p) : p.endsWith(".tsx") ? [p] : [];
  });
}

async function compiledCss(): Promise<string> {
  const globals = fs.readFileSync(path.join(ROOT, "app/globals.css"), "utf8");
  const result = await postcss([
    tailwindcss(path.join(ROOT, "tailwind.config.js")),
  ]).process(globals, { from: path.join(ROOT, "app/globals.css") });
  return result.css;
}

describe("focus visibility", () => {
  it("declares the focus-visible outline where a utility cannot outrank it", async () => {
    const css = await compiledCss();

    const focusRule = css.indexOf("input:focus-visible");
    const outlineNone = css.indexOf(".outline-none");

    expect(focusRule, "focus-visible rule must exist").toBeGreaterThan(-1);

    // Element selectors give the rule specificity (0,1,1) against
    // `.outline-none`'s (0,1,0). The `:where()` form this replaced scored
    // (0,1,0) and tied, which is how a utility silently won.
    expect(css).toMatch(/input:focus-visible[^{]*\{[^}]*outline:\s*2px solid/);

    // Belt and braces: even at equal specificity the later rule wins, so the
    // focus rule must also come after the utility in source order.
    if (outlineNone > -1) {
      expect(focusRule).toBeGreaterThan(outlineNone);
    }
  });

  it("resolves the focus ring colour in light, dark and masthead contexts", async () => {
    const css = await compiledCss();

    expect(css).toMatch(/--focus-ring:\s*var\(--color-ink\)/);
    expect(css).toMatch(/html\.dark\s*\{[^}]*--focus-ring:\s*var\(--color-turmeric\)/);
    expect(css).toMatch(/\.on-masthead\s*\{[^}]*--focus-ring:\s*var\(--color-turmeric\)/);
  });

  it("has no element that strips its outline without a focus-visible replacement", () => {
    const offenders: string[] = [];

    for (const file of tsxFiles("app")) {
      const source = stripComments(fs.readFileSync(path.join(ROOT, file), "utf8"));
      source.split("\n").forEach((line, index) => {
        // Per ELEMENT, not per file: the old guard passed a file that stripped
        // the outline on one element and restored it on a different one.
        for (const literal of line.match(/["'`][^"'`]*["'`]/g) ?? []) {
          const body = literal.slice(1, -1);
          if (!/(^|\s)(focus:|focus-visible:)?outline-none(\s|$)/.test(body)) continue;
          // Any `focus-visible:` utility counts as a deliberate replacement —
          // an outline, a ring, or an underline are all visible changes. A
          // `focus:`-only fallback does not: `focus:border-<colour>` is a
          // border colour change, which DESIGN_SYSTEM.md §6.3 rules out as the
          // sole indicator.
          if (/focus-visible:[a-z]/.test(body)) continue;
          offenders.push(`${file}:${index + 1} -> ${body.trim().slice(0, 70)}`);
        }
      });
    }

    expect(offenders).toEqual([]);
  });

  it("never sets a ring colour without a ring width", () => {
    const offenders: string[] = [];

    for (const file of tsxFiles("app")) {
      const source = stripComments(fs.readFileSync(path.join(ROOT, file), "utf8"));
      source.split("\n").forEach((line, index) => {
        for (const literal of line.match(/["'`][^"'`]*["'`]/g) ?? []) {
          const body = literal.slice(1, -1);
          // A ring colour is `ring-<name>`; a ring width is `ring` or
          // `ring-<number>`. Colour alone leaves --tw-ring-shadow transparent.
          const hasColour = /(^|\s)(?:[\w-]+:)*ring-(?!\d|inset|offset)[a-zA-Z]/.test(body);
          if (!hasColour) continue;
          const hasWidth = /(^|\s)(?:[\w-]+:)*ring(?:-\d)?(\s|$)/.test(body);
          if (hasWidth) continue;
          offenders.push(`${file}:${index + 1} -> ${body.trim().slice(0, 70)}`);
        }
      });
    }

    expect(offenders).toEqual([]);
  });
});

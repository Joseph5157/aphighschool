// @vitest-environment node
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), "utf8");

function tsxFiles(dir: string): string[] {
  const full = path.join(process.cwd(), dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? tsxFiles(p) : p.endsWith(".tsx") ? [p] : [];
  });
}

const FILES = tsxFiles("app/(public)");

describe("accessibility guards", () => {
  it("marks every font-telugu element with lang=te", () => {
    const offenders: string[] = [];
    for (const file of FILES) {
      const source = read(file);
      for (const match of source.matchAll(/<(\w+)[^>]*className={?[^>]*font-telugu[^>]*>/g)) {
        // The opening tag must also carry lang="te".
        if (!/lang="te"/.test(match[0])) offenders.push(`${file}: ${match[0].slice(0, 80)}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  // The focus-outline check that used to live here was removed in UI-SYSTEM-2.
  // test/focus-visible.test.ts replaces it and is strictly stronger:
  //
  //  - it matches per ELEMENT, not per file, so a file that strips the outline
  //    on one control and restores it on a different one no longer passes;
  //  - it catches the bare `outline-none` that Input and NativeSelect actually
  //    used, which this pattern's `focus:` prefix never matched — the reason
  //    the P0 focus defect survived it;
  //  - it strips comments first. This check's last act was to fail on
  //    Textarea.tsx for a comment *explaining* the defect, which is the kind of
  //    false positive that teaches people to ignore a guard.

  it("has no button nested inside a link", () => {
    const offenders: string[] = [];
    for (const file of FILES) {
      const source = read(file);
      // Crude but effective: a <Link ...> whose closing </Link> is preceded by a <button
      for (const match of source.matchAll(/<Link[\s\S]{0,600}?<\/Link>/g)) {
        if (/<button|<Button/.test(match[0])) offenders.push(`${file}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

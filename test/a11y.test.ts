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

  it("never strips a focus outline without a focus-visible replacement", () => {
    const offenders: string[] = [];
    for (const file of FILES) {
      const source = read(file);
      if (/focus:outline-none/.test(source) && !/focus-visible:ring|focus-visible:outline/.test(source)) {
        offenders.push(file);
      }
    }
    expect(offenders).toEqual([]);
  });

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

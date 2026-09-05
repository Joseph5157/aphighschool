// @vitest-environment node
import { describe, it, expect, beforeAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { testDb } from "./db";

function tsxFiles(dir: string): string[] {
  const full = path.join(process.cwd(), dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? tsxFiles(p) : p.endsWith(".tsx") ? [p] : [];
  });
}

// Static routes that exist as page.tsx files.
const STATIC_ROUTES = new Set([
  "/", "/orders", "/search", "/tools", "/service-desk", "/admin", "/admin/posts", "/admin/posts/new",
  "/tools/cfms-checker", "/tools/da-arrears", "/tools/gpf-apgli",
  "/tools/leave-encashment", "/tools/tax-calculator", "/tools/prc-calculator",
  "/pensioners", "/pensioners/pension-calculator", "/pensioners/commutation-tracker",
  "/pensioners/office-pipeline",
]);

let postSlugs: Set<string>;
let categorySlugs: Set<string>;

beforeAll(async () => {
  postSlugs = new Set((await testDb.post.findMany({ select: { slug: true } })).map((p) => p.slug));
  categorySlugs = new Set(
    (await testDb.category.findMany({ select: { slug: true } })).map((c) => c.slug)
  );
});

describe("internal link crawl", () => {
  it("every hardcoded internal href resolves", () => {
    const broken: string[] = [];

    for (const file of tsxFiles("app")) {
      const source = fs.readFileSync(path.join(process.cwd(), file), "utf8");
      for (const match of source.matchAll(/href="(\/[^"{}]*)"/g)) {
        const href = match[1].split("?")[0].replace(/\/$/, "") || "/";

        if (STATIC_ROUTES.has(href)) continue;
        if (href.startsWith("/posts/")) {
          if (!postSlugs.has(href.slice("/posts/".length))) broken.push(`${file}: ${href}`);
          continue;
        }
        if (href.startsWith("/category/")) {
          if (!categorySlugs.has(href.slice("/category/".length))) broken.push(`${file}: ${href}`);
          continue;
        }
        broken.push(`${file}: ${href} (unknown route)`);
      }
    }

    expect(broken).toEqual([]);
  });
});

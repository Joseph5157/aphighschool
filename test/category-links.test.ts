// @vitest-environment node
import { describe, it, expect, beforeEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import DesktopLeftNav from "@/app/(public)/_components/DesktopLeftNav";
import { resetDb, seedCategory, makePost } from "./db";

const NAV = path.join(
  process.cwd(),
  "app",
  "(public)",
  "_components",
  "DesktopLeftNav.tsx"
);

const DEAD_SLUGS = ["school-education", "finance", "higher-education", "dse-circulars"];

describe("department rail (source)", () => {
  it("does not hardcode category slugs that do not exist", () => {
    const source = fs.readFileSync(NAV, "utf8");
    for (const slug of DEAD_SLUGS) {
      expect(source).not.toContain(slug);
    }
  });

  it("reads categories from Prisma", () => {
    const source = fs.readFileSync(NAV, "utf8");
    expect(source).toContain("prisma.category.findMany");
  });

  it("does not hardcode post counts", () => {
    const source = fs.readFileSync(NAV, "utf8");
    expect(source).toMatch(/_count/);
  });
});

// DesktopLeftNav is an async Server Component, so Testing Library's render()
// cannot mount it (it takes no client-renderable element, it's a Promise).
// Calling it directly and handing the resolved element tree to
// renderToStaticMarkup works instead, and lets these assertions check real
// rendered output — hrefs and badge text — against a seeded test database,
// rather than only the component's source text.
describe("department rail (rendered)", () => {
  beforeEach(resetDb);

  it("links to every non-tools category and omits tools", async () => {
    await seedCategory("govt-orders");
    await seedCategory("circulars");
    await seedCategory("tools");

    const html = renderToStaticMarkup(await DesktopLeftNav());

    expect(html).toContain('href="/category/govt-orders"');
    expect(html).toContain('href="/category/circulars"');
    expect(html).not.toContain('href="/category/tools"');
  });

  it("counts only published posts for a category, excluding drafts", async () => {
    const cat = await seedCategory("govt-orders");
    await makePost({ categoryId: cat.id, isDraft: false });
    await makePost({ categoryId: cat.id, isDraft: false });
    await makePost({ categoryId: cat.id, isDraft: true });

    const html = renderToStaticMarkup(await DesktopLeftNav());

    const linkMatch = html.match(
      /<a[^>]*href="\/category\/govt-orders"[^>]*>([\s\S]*?)<\/a>/
    );
    expect(linkMatch).not.toBeNull();
    const block = linkMatch![1];

    // 2 published posts, 1 draft: the rendered badge must read 2, never 3.
    expect(block).toContain(">2<");
    expect(block).not.toContain(">3<");
  });
});

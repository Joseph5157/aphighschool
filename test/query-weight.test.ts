// @vitest-environment node
//
// UI-PERF-1: guards against two list-page queries silently going back to an
// unbounded/unselected `include`, which fetches every Post column — the
// `content` field (full document body/tables) especially — for every row in
// the list, then ships it to the client in the RSC payload even though the
// list surfaces never render it. See UI_ACTIVE_GATE.md for the full finding.
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const categoryDetail = fs.readFileSync(
  path.join(process.cwd(), "app", "(public)", "category", "[slug]", "page.tsx"),
  "utf8"
);
const home = fs.readFileSync(
  path.join(process.cwd(), "app", "(public)", "(home)", "page.tsx"),
  "utf8"
);

describe("list-page query weight guards", () => {
  it("category page's posts list is field-selected, not a bare include", () => {
    const block = categoryDetail.slice(
      categoryDetail.indexOf("posts: {", categoryDetail.indexOf("include: {")),
      categoryDetail.indexOf("_count:")
    );
    expect(block).toMatch(/select\s*:\s*\{/);
    expect(block).not.toMatch(/content\s*:\s*true/);
  });

  it("homepage feed query is field-selected, not a bare include", () => {
    const block = home.slice(
      home.indexOf("prisma.post.findMany"),
      home.indexOf("safeQuery(\"homepage-upcoming-action-dates\"")
    );
    expect(block).toMatch(/select\s*:\s*\{/);
    expect(block).not.toMatch(/content\s*:\s*true/);
    // relatedFrom was fetched here and never rendered by HeroCard/PostCard —
    // removed rather than selected down, since nothing on this page needs it.
    // (Matches the Prisma field key specifically, not this file's own prose.)
    expect(block).not.toMatch(/relatedFrom\s*:/);
  });
});

import { describe, it, expect } from "vitest";
import { tsxFiles, readSource, stripComments } from "./class-source";

// Found during UI-SEO-1: "Offline Ready" / "Client-Side & Offline Ready" appeared in
// two places (the sidebar footer, DesktopSidebar's calculator widget) with no service
// worker, manifest, or cache strategy anywhere in the repo to back the claim — the
// same "nothing may be invented" defect shape as UI-CONTENT-1's WhatsApp banner (F16).
// Fixed to state only what's actually true: the calculators run client-side; the site
// itself is not offline-capable.
describe("no unsupported offline-capability claim in the public app", () => {
  it("never claims the site is offline-ready anywhere under app/(public)", () => {
    const files = tsxFiles("app/(public)");
    const hits: string[] = [];

    for (const file of files) {
      const source = stripComments(readSource(file));
      if (/offline.?ready/i.test(source)) hits.push(file);
    }

    expect(hits).toEqual([]);
  });
});

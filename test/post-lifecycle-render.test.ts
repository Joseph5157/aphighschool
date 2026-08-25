// @vitest-environment node
//
// Stands in for the brief's Step 11 manual browser check, which cannot run here
// (the dev server does not start under a sandboxed agent). Instead of eyeballing
// the page, this renders the real /posts/[slug] Server Component against a
// seeded database and asserts on the actual HTML — a stronger check than the
// manual one, because it re-runs on every commit.
//
// PostDetailPage is an async Server Component, so Testing Library cannot mount
// it. Calling it and handing the resolved tree to renderToStaticMarkup is the
// pattern already used by test/category-links.test.ts.
import { describe, it, expect, beforeEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import PostDetailPage from "@/app/(public)/posts/[slug]/page";
import { resetDb, makePost } from "./db";

async function renderPost(slug: string) {
  return renderToStaticMarkup(await PostDetailPage({ params: { slug } }));
}

describe("post detail lifecycle rendering", () => {
  beforeEach(resetDb);

  it("shows a circular its order state, never recruitment stages", async () => {
    // statusBadge is deliberately "expired": under the old universal stepper
    // that mapped straight to stage 4, "Results" — the exact defect this task
    // removes. A DA arrears circular is not awaiting exam results.
    await makePost({
      slug: "da-arrears-circular",
      titleEn: "DA Arrears Payment Schedule",
      isDraft: false,
      documentType: "circular",
      orderState: "current",
      statusBadge: "expired",
    });

    const html = await renderPost("da-arrears-circular");

    expect(html).toContain("Document Status");
    expect(html).toContain("Current");
    expect(html).not.toMatch(/Hall ticket/i);
    expect(html).not.toMatch(/Results/i);
    expect(html).not.toContain("Lifecycle Stage");
  });

  it("shows a government order its order state, never recruitment stages", async () => {
    await makePost({
      slug: "go-129-allocation",
      titleEn: "District Allocation Order",
      isDraft: false,
      documentType: "go",
      orderState: "superseded",
      statusBadge: "results",
    });

    const html = await renderPost("go-129-allocation");

    expect(html).toContain("Document Status");
    expect(html).toContain("Superseded");
    expect(html).not.toMatch(/Hall ticket/i);
    expect(html).not.toContain("Lifecycle Stage");
  });

  it("shows a recruitment notification the four-stage stepper", async () => {
    await makePost({
      slug: "ap-tet-2026",
      titleEn: "AP TET 2026 Notification",
      isDraft: false,
      documentType: "notification",
      orderState: "current",
      statusBadge: "hall_ticket",
    });

    const html = await renderPost("ap-tet-2026");

    expect(html).toContain("Lifecycle Stage");
    for (const stage of ["Notified", "Apply open", "Hall ticket", "Results"]) {
      expect(html).toContain(stage);
    }
    expect(html).not.toContain("Document Status");
  });

  it("marks the notification's current stage, not simply every stage", async () => {
    // Guards the stages/currentStage props actually being threaded through:
    // a stepper handed the labels but not the index would still contain all
    // four stage names and pass the test above.
    await makePost({
      slug: "ap-tet-2026-stage",
      titleEn: "AP TET 2026 Notification",
      isDraft: false,
      documentType: "notification",
      orderState: "current",
      statusBadge: "hall_ticket",
    });

    const html = await renderPost("ap-tet-2026-stage");

    // Stages 1 and 2 are done (rendered as a tick), 3 is current (rendered as
    // its own number), 4 is still pending (also its number).
    const ticks = html.match(/✓/g) ?? [];
    expect(ticks).toHaveLength(2);
    expect(html).toContain(">3<");
    expect(html).toContain(">4<");
  });

  it("falls back to the first stage for a notification with no stage set", async () => {
    await makePost({
      slug: "ap-dsc-2026",
      titleEn: "AP DSC 2026 Notification",
      isDraft: false,
      documentType: "notification",
      orderState: "current",
      statusBadge: "notification",
    });

    const html = await renderPost("ap-dsc-2026");

    expect(html).toContain("Lifecycle Stage");
    expect(html).not.toMatch(/✓/);
  });

  it("treats a post with no document type as a plain state document", async () => {
    await makePost({
      slug: "untyped-order",
      titleEn: "Untyped Order",
      isDraft: false,
      documentType: null,
      orderState: "archived",
      statusBadge: "hall_ticket",
    });

    const html = await renderPost("untyped-order");

    expect(html).toContain("Document Status");
    expect(html).toContain("Archived");
    expect(html).not.toContain("Lifecycle Stage");
  });
});

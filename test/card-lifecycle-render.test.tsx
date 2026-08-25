// Task 14 fixed the lifecycle display on the post DETAIL page only. Every
// list/card surface still mapped statusBadge straight to a recruitment label,
// so a DA arrears circular showed a green "Results" pill on its homepage card.
//
// These render the three card surfaces directly. Each one is checked in both
// directions: a state document must NOT show a recruitment label, and a
// recruitment notification must STILL show one. Gating everything to "Current"
// would satisfy a negative-only test while destroying the feature.
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import type { DocType, OrderState } from "@prisma/client";
import PostCard from "@/app/(public)/_components/PostCard";
import HeroCard from "@/app/(public)/_components/HeroCard";
import CategoryLogList from "@/app/(public)/category/[slug]/_components/CategoryLogList";

type CardPost = {
  id: string;
  slug: string;
  titleEn: string;
  titleTe: string;
  summaryTe: string[];
  englishAbstract: string | null;
  statusBadge: string;
  documentType: DocType | null;
  orderState: OrderState;
  goReference: string | null;
  sourceDept: string | null;
  actionDeadline: Date | null;
  verifiedAgainstGoir: boolean;
  createdAt: Date;
  documentDate: Date | null;
  tags: string[];
  category: { nameEn: string; slug: string; color: string | null; icon: string | null } | null;
};

// Titles are deliberately free of the words under assertion ("Results",
// "Current", "Hall ticket") so a match can only have come from the pill.
function makePost(overrides: Partial<CardPost> = {}): CardPost {
  return {
    id: "p1",
    slug: "da-arrears-payment-schedule-2026",
    titleEn: "Dearness Allowance Arrears Installments Release",
    titleTe: "కరువు భత్యం బకాయిల విడుదల",
    summaryTe: ["జీపిఎఫ్ అకౌంట్‌లో జమ చేసేందుకు ఉత్తర్వులు."],
    englishAbstract: null,
    statusBadge: "results",
    documentType: "circular",
    orderState: "current",
    goReference: null,
    sourceDept: null,
    actionDeadline: null,
    verifiedAgainstGoir: false,
    createdAt: new Date("2026-02-08T00:00:00.000Z"),
    documentDate: new Date("2026-02-08T00:00:00.000Z"),
    tags: [],
    category: null,
    ...overrides,
  };
}

// Three surfaces, three renderers, one table of expectations. CategoryLogList
// uses Title Case ("Hall Ticket") where the other two use sentence case
// ("Hall ticket"), so the recruitment label is per-surface.
const SURFACES = [
  {
    name: "PostCard",
    hallTicketLabel: "Hall ticket",
    html: (post: CardPost) => render(<PostCard post={post} />).container.innerHTML,
  },
  {
    name: "HeroCard",
    hallTicketLabel: "Hall ticket",
    html: (post: CardPost) => render(<HeroCard post={post} />).container.innerHTML,
  },
  {
    name: "CategoryLogList",
    hallTicketLabel: "Hall Ticket",
    html: (post: CardPost) => render(<CategoryLogList posts={[post]} />).container.innerHTML,
  },
] as const;

describe.each(SURFACES)("$name lifecycle pill", ({ hallTicketLabel, html }) => {
  it("shows a circular its order state, never a recruitment label", () => {
    const markup = html(makePost({ documentType: "circular", statusBadge: "results", orderState: "current" }));

    expect(markup).toContain("Current");
    expect(markup).not.toMatch(/Results/i);
    expect(markup).not.toMatch(/Hall ticket/i);
  });

  it("shows a government order its order state, never a recruitment label", () => {
    const markup = html(makePost({ documentType: "go", statusBadge: "hall_ticket", orderState: "superseded" }));

    expect(markup).toContain("Superseded");
    expect(markup).not.toMatch(/Hall ticket/i);
  });

  it("reads the label from orderState, not a fixed 'Current'", () => {
    // A gate that hardcoded "Current" for every state document would pass the
    // first case above. These pin the label to the actual column value.
    for (const [state, label] of [
      ["amended", "Amended"],
      ["archived", "Archived"],
    ] as const) {
      const markup = html(makePost({ documentType: "memo", statusBadge: "results", orderState: state }));
      expect(markup).toContain(label);
      expect(markup).not.toMatch(/Results/i);
    }
  });

  it("treats a post with no document type as a state document", () => {
    const markup = html(makePost({ documentType: null, statusBadge: "results", orderState: "archived" }));

    expect(markup).toContain("Archived");
    expect(markup).not.toMatch(/Results/i);
  });

  it("still shows a recruitment notification its stage label", () => {
    const markup = html(
      makePost({ documentType: "notification", statusBadge: "hall_ticket", orderState: "current" })
    );

    expect(markup).toContain(hallTicketLabel);
    expect(markup).not.toContain("Current");
  });

  it("still shows a recruitment notification at Results", () => {
    const markup = html(
      makePost({ documentType: "notification", statusBadge: "results", orderState: "current" })
    );

    expect(markup).toContain("Results");
    expect(markup).not.toContain("Current");
  });
});

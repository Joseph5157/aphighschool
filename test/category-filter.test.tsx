// The Open/Closed filter lives in CategoryLogList's useState, so it is INVISIBLE
// to a static render: test/list-lifecycle-render.test.ts and
// test/card-lifecycle-render.test.tsx both only ever see the default "All"
// filter, and would keep passing with the filter wired to any rule at all.
// (Task 14b learned this the hard way with LifecycleStepper: a markup-only
// assertion could not see a defect that only shows up at runtime.)
//
// These tests actually CLICK the filter, which is the only way to prove that
// CategoryLogList routes through lib/posts/lifecycle rather than keeping its own
// parallel `statusBadge === "expired"` rule. test/lifecycle.test.ts pins what the
// rule SAYS; this file pins that the component ASKS it.
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import type { DocType, OrderState } from "@prisma/client";
import CategoryLogList from "@/app/(public)/category/[slug]/_components/CategoryLogList";

afterEach(cleanup);

type LogPost = {
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
  actionDeadline: Date | null;
  createdAt: Date;
  documentDate: Date | null;
  tags: string[];
};

// Titles are deliberately unique per row and free of any word this file filters
// on, so a title match can only mean that row was rendered.
function makePost(id: string, overrides: Partial<LogPost> = {}): LogPost {
  return {
    id,
    slug: `post-${id}`,
    titleEn: `Document ${id}`,
    titleTe: "పత్రం",
    summaryTe: ["సారాంశం."],
    englishAbstract: null,
    statusBadge: "notification",
    documentType: "go",
    orderState: "current",
    goReference: null,
    actionDeadline: null,
    createdAt: new Date("2026-02-08T00:00:00.000Z"),
    documentDate: new Date("2026-02-08T00:00:00.000Z"),
    tags: [],
    ...overrides,
  };
}

function clickFilter(name: "All" | "Open" | "Closed") {
  fireEvent.click(screen.getByRole("button", { name }));
}

function titlesShown(): string[] {
  return screen
    .getAllByRole("heading", { level: 3 })
    .map((h) => h.textContent ?? "");
}

describe("CategoryLogList Open/Closed filter", () => {
  // The exact row that exposed the contradiction: prisma/seed.ts's GO 21 shape
  // BEFORE its orderState was corrected — documentType "go", statusBadge
  // "expired", orderState "current". Its pill reads a green "Current", so the
  // Open filter must show it and the Closed filter must hide it. The old rule
  // did precisely the opposite.
  const EXPIRED_BADGE_GO_IN_FORCE = makePost("go-in-force", {
    titleEn: "PTR Norms Guidelines",
    documentType: "go",
    statusBadge: "expired",
    orderState: "current",
  });

  const SUPERSEDED_GO = makePost("go-superseded", {
    titleEn: "District Allocation Guidelines",
    documentType: "go",
    statusBadge: "notification",
    orderState: "superseded",
  });

  const EXPIRED_NOTIFICATION = makePost("notification-expired", {
    titleEn: "Teacher Eligibility Test Application",
    documentType: "notification",
    statusBadge: "expired",
    orderState: "current",
  });

  const LIVE_NOTIFICATION = makePost("notification-live", {
    titleEn: "Mega Recruitment Examination",
    documentType: "notification",
    statusBadge: "hall_ticket",
    orderState: "current",
  });

  const ALL = [
    EXPIRED_BADGE_GO_IN_FORCE,
    SUPERSEDED_GO,
    EXPIRED_NOTIFICATION,
    LIVE_NOTIFICATION,
  ];

  // Premise check, kept separate so it cannot mask the filter assertions
  // below: the pill on the expired-badge GO reads "Current". If this ever
  // flips back to "Expired", the contradiction the next test describes is not
  // the contradiction it is actually guarding.
  it("renders the expired-badge GO with a Current pill", () => {
    render(<CategoryLogList posts={[EXPIRED_BADGE_GO_IN_FORCE]} />);

    expect(screen.getByText("Current")).toBeInTheDocument();
    expect(screen.queryByText("Expired")).not.toBeInTheDocument();
  });

  it("files a state document by whether its order is still in force, not by statusBadge", () => {
    render(<CategoryLogList posts={ALL} />);

    clickFilter("Open");
    expect(titlesShown()).toEqual(["PTR Norms Guidelines", "Mega Recruitment Examination"]);

    clickFilter("Closed");
    expect(titlesShown()).toEqual([
      "District Allocation Guidelines",
      "Teacher Eligibility Test Application",
    ]);
  });

  it("still files an expired recruitment notification as Closed", () => {
    render(<CategoryLogList posts={[EXPIRED_NOTIFICATION, LIVE_NOTIFICATION]} />);

    clickFilter("Closed");
    expect(titlesShown()).toEqual(["Teacher Eligibility Test Application"]);

    clickFilter("Open");
    expect(titlesShown()).toEqual(["Mega Recruitment Examination"]);
  });

  it("closes any document whose action deadline has passed, whatever its kind", () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

    render(
      <CategoryLogList
        posts={[
          makePost("go-deadline-passed", {
            titleEn: "Allocation Window Ended",
            documentType: "go",
            statusBadge: "apply_link",
            orderState: "current",
            actionDeadline: yesterday,
          }),
          makePost("go-deadline-ahead", {
            titleEn: "Allocation Window Ahead",
            documentType: "go",
            statusBadge: "apply_link",
            orderState: "current",
            actionDeadline: tomorrow,
          }),
        ]}
      />
    );

    clickFilter("Closed");
    expect(titlesShown()).toEqual(["Allocation Window Ended"]);

    clickFilter("Open");
    expect(titlesShown()).toEqual(["Allocation Window Ahead"]);
  });

  it("shows every document under All", () => {
    render(<CategoryLogList posts={ALL} />);
    expect(titlesShown()).toHaveLength(4);
  });
});

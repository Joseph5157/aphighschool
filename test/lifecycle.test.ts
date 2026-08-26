// @vitest-environment node
import { describe, it, expect } from "vitest";
import type { DocType, OrderState } from "@prisma/client";
import { resolveLifecycle, isLifecycleClosed } from "@/lib/posts/lifecycle";
import {
  resolveLifecyclePill,
  type RecruitmentPill,
} from "@/app/(public)/_components/lifecyclePill";

describe("resolveLifecycle", () => {
  it("shows recruitment stages for a notification", () => {
    const view = resolveLifecycle({
      documentType: "notification",
      statusBadge: "hall_ticket",
      orderState: "current",
    });
    expect(view.kind).toBe("recruitment");
    if (view.kind !== "recruitment") throw new Error("wrong kind");
    expect(view.stages).toEqual(["Notified", "Apply open", "Hall ticket", "Results"]);
    expect(view.currentStage).toBe(3);
  });

  it("never shows recruitment stages for a circular", () => {
    const view = resolveLifecycle({
      documentType: "circular",
      statusBadge: "results",
      orderState: "current",
    });
    expect(view.kind).toBe("state");
  });

  it("never shows Hall ticket or Results for a government order", () => {
    const view = resolveLifecycle({
      documentType: "go",
      statusBadge: "expired",
      orderState: "archived",
    });
    if (view.kind !== "state") throw new Error("wrong kind");
    expect(view.label).toBe("Archived");
    expect(JSON.stringify(view)).not.toMatch(/Hall ticket|Results/);
  });

  it("labels each order state", () => {
    const cases = [
      ["current", "Current"],
      ["amended", "Amended"],
      ["superseded", "Superseded"],
      ["archived", "Archived"],
    ] as const;
    for (const [state, label] of cases) {
      const view = resolveLifecycle({ documentType: "memo", statusBadge: "notification", orderState: state });
      if (view.kind !== "state") throw new Error("wrong kind");
      expect(view.label).toBe(label);
    }
  });

  it("treats an unknown document type as a plain state document", () => {
    const view = resolveLifecycle({
      documentType: null,
      statusBadge: "apply_link",
      orderState: "current",
    });
    expect(view.kind).toBe("state");
  });

  it("marks an expired recruitment notification as expired at the final stage", () => {
    const view = resolveLifecycle({
      documentType: "notification",
      statusBadge: "expired",
      orderState: "current",
    });
    if (view.kind !== "recruitment") throw new Error("wrong kind");
    expect(view.isExpired).toBe(true);
    expect(view.currentStage).toBe(4);
  });
});

// The category log's Open/Closed filter used to branch on `statusBadge ===
// "expired"` for EVERY document, while the pill beside it (ba86fdb) branches on
// documentType. The two halves of the same row then disagreed: the seeded GO 21
// showed a green "Current" pill and was simultaneously hidden by "Open" and
// listed under "Closed".
//
// "Open"/"Closed" now means "is this document still live?", answered by the
// SAME resolveLifecycle model the pill uses:
//   - recruitment document -> is the application window over (statusBadge
//     "expired")?
//   - state document -> is the order still in force (current/amended) or not
//     (superseded/archived)?
//   - either kind -> a passed actionDeadline closes it. Orthogonal to both.
describe("isLifecycleClosed", () => {
  const NOW = new Date("2026-08-25T00:00:00.000Z");

  it("keeps a state document open while its order is in force", () => {
    for (const orderState of ["current", "amended"] as const) {
      expect(
        isLifecycleClosed({ documentType: "go", statusBadge: "expired", orderState }, NOW)
      ).toBe(false);
    }
  });

  it("closes a state document once its order is no longer in force", () => {
    for (const orderState of ["superseded", "archived"] as const) {
      expect(
        isLifecycleClosed({ documentType: "go", statusBadge: "notification", orderState }, NOW)
      ).toBe(true);
    }
  });

  it("ignores statusBadge entirely for a state document", () => {
    // The whole point of the fix: a GO's `expired` badge is not read by the
    // pill, so it must not be read by the filter either.
    expect(
      isLifecycleClosed(
        { documentType: "circular", statusBadge: "expired", orderState: "current" },
        NOW
      )
    ).toBe(false);
    expect(
      isLifecycleClosed(
        { documentType: "circular", statusBadge: "results", orderState: "archived" },
        NOW
      )
    ).toBe(true);
  });

  it("still closes an expired recruitment notification", () => {
    expect(
      isLifecycleClosed(
        { documentType: "notification", statusBadge: "expired", orderState: "current" },
        NOW
      )
    ).toBe(true);
  });

  it("ignores orderState entirely for a recruitment notification", () => {
    // A notification renders application stages, never an order state, so an
    // archived orderState must not close it behind the reader's back.
    expect(
      isLifecycleClosed(
        { documentType: "notification", statusBadge: "hall_ticket", orderState: "archived" },
        NOW
      )
    ).toBe(false);
  });

  it("treats an untyped document as a state document", () => {
    expect(
      isLifecycleClosed({ documentType: null, statusBadge: "expired", orderState: "current" }, NOW)
    ).toBe(false);
    expect(
      isLifecycleClosed(
        { documentType: null, statusBadge: "notification", orderState: "superseded" },
        NOW
      )
    ).toBe(true);
  });

  it("closes either kind of document once its action deadline has passed", () => {
    const past = new Date("2026-08-24T00:00:00.000Z");
    for (const documentType of ["go", "notification"] as const) {
      expect(
        isLifecycleClosed(
          { documentType, statusBadge: "apply_link", orderState: "current", actionDeadline: past },
          NOW
        )
      ).toBe(true);
    }
  });

  it("leaves either kind open while its action deadline is still ahead", () => {
    const future = new Date("2026-08-30T00:00:00.000Z");
    for (const documentType of ["go", "notification"] as const) {
      expect(
        isLifecycleClosed(
          {
            documentType,
            statusBadge: "apply_link",
            orderState: "current",
            actionDeadline: future,
          },
          NOW
        )
      ).toBe(false);
    }
  });

  it("accepts an actionDeadline that crossed the RSC boundary as a string", () => {
    expect(
      isLifecycleClosed(
        {
          documentType: "go",
          statusBadge: "apply_link",
          orderState: "current",
          actionDeadline: "2026-08-24T00:00:00.000Z",
        },
        NOW
      )
    ).toBe(true);
  });
});

// The defect this task fixes was not "the filter is wrong" in isolation — it
// was the filter and the pill DISAGREEING about the same row. These pin the
// pairing directly, with the expected pill label and the expected filter answer
// both written out by hand rather than derived from each other, so a filter
// that drifted back to its own parallel statusBadge rule goes red here.
describe("the Open/Closed filter agrees with the pill beside it", () => {
  const NOW = new Date("2026-08-25T00:00:00.000Z");

  // CategoryLogList's own Title Case recruitment map.
  const RECRUITMENT: RecruitmentPill = {
    labels: {
      notification: "Notified",
      apply_link: "Apply Open",
      hall_ticket: "Hall Ticket",
      results: "Results",
      expired: "Expired",
    },
    variants: {
      notification: "turmeric",
      apply_link: "success",
      hall_ticket: "turmeric",
      results: "success",
      expired: "neutral",
    },
    fallbackVariant: "neutral",
  };

  // A pill that reads "in force" must not be filed under Closed, and vice
  // versa. Stated as data so the contract is readable at a glance.
  const IN_FORCE_LABELS = ["Current", "Amended"];
  const NOT_IN_FORCE_LABELS = ["Superseded", "Archived"];

  const CASES: Array<{
    what: string;
    documentType: DocType | null;
    statusBadge: string;
    orderState: OrderState;
    pill: string;
    closed: boolean;
  }> = [
    // The seeded GO 21 shape — the row that exposed the contradiction.
    { what: "expired GO still in force", documentType: "go", statusBadge: "expired", orderState: "current", pill: "Current", closed: false },
    { what: "expired GO superseded", documentType: "go", statusBadge: "expired", orderState: "superseded", pill: "Superseded", closed: true },
    { what: "GO amended", documentType: "go", statusBadge: "notification", orderState: "amended", pill: "Amended", closed: false },
    { what: "GO archived", documentType: "go", statusBadge: "notification", orderState: "archived", pill: "Archived", closed: true },
    { what: "DA arrears circular", documentType: "circular", statusBadge: "results", orderState: "current", pill: "Current", closed: false },
    { what: "untyped document", documentType: null, statusBadge: "expired", orderState: "superseded", pill: "Superseded", closed: true },
    // Recruitment side: unchanged behaviour, and orderState must stay inert.
    { what: "expired notification", documentType: "notification", statusBadge: "expired", orderState: "current", pill: "Expired", closed: true },
    { what: "notification at hall ticket", documentType: "notification", statusBadge: "hall_ticket", orderState: "archived", pill: "Hall Ticket", closed: false },
    { what: "notification at results", documentType: "notification", statusBadge: "results", orderState: "superseded", pill: "Results", closed: false },
  ];

  it.each(CASES)("$what: pill $pill, closed=$closed", (c) => {
    const post = {
      documentType: c.documentType,
      statusBadge: c.statusBadge,
      orderState: c.orderState,
    };

    expect(resolveLifecyclePill(post, RECRUITMENT).label).toBe(c.pill);
    expect(isLifecycleClosed(post, NOW)).toBe(c.closed);

    // The invariant, restated independently of the table: whatever the pill
    // says about a state document, the filter must not contradict it.
    if (IN_FORCE_LABELS.includes(c.pill)) expect(isLifecycleClosed(post, NOW)).toBe(false);
    if (NOT_IN_FORCE_LABELS.includes(c.pill)) expect(isLifecycleClosed(post, NOW)).toBe(true);
  });
});

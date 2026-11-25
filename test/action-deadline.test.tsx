// actionDeadline is an inclusive calendar date in Asia/Kolkata, not an instant.
//
// The admin form saves a date-only value through `new Date("YYYY-MM-DD")`, which
// is 00:00 UTC = 05:30 IST on that day. Every consumer used to compare that
// instant against `now`, so a post with a 30 Nov deadline showed "Deadline
// passed" and was filtered as Closed from 05:30 IST on 30 Nov — the official
// last day. These cases pin both sides of the UTC and IST day boundaries.
import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import React from "react";

vi.mock("next/navigation", () => ({ usePathname: () => "/posts/x" }));
vi.stubGlobal(
  "IntersectionObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
);

import { deadlineDateIST, isDeadlinePassed, startOfTodayIST } from "@/lib/dates";
import { isLifecycleClosed } from "@/lib/posts/lifecycle";
import DocumentTemplate from "@/app/(public)/posts/[slug]/_templates/DocumentTemplate";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

// How the admin form and the scraper store "2026-11-30".
const STORED_UTC_MIDNIGHT = new Date("2026-11-30");
// The same calendar day stored as IST midnight (a write path that sends +05:30).
const STORED_IST_MIDNIGHT = new Date("2026-11-30T00:00:00+05:30");

const MOMENTS = [
  { label: "29 Nov 23:59 IST", now: "2026-11-29T18:29:59Z", passed: false },
  { label: "30 Nov 00:00 IST", now: "2026-11-29T18:30:00Z", passed: false },
  { label: "30 Nov 05:30 IST (the old bug's flip point)", now: "2026-11-30T00:00:00Z", passed: false },
  { label: "30 Nov 12:00 IST", now: "2026-11-30T06:30:00Z", passed: false },
  { label: "30 Nov 23:59:59 IST", now: "2026-11-30T18:29:59Z", passed: false },
  { label: "1 Dec 00:00 IST", now: "2026-11-30T18:30:00Z", passed: true },
  { label: "1 Dec 05:30 IST", now: "2026-12-01T00:00:00Z", passed: true },
] as const;

describe("deadlineDateIST", () => {
  it("reads both storage forms as the same IST calendar date", () => {
    expect(deadlineDateIST(STORED_UTC_MIDNIGHT)).toBe("2026-11-30");
    expect(deadlineDateIST(STORED_IST_MIDNIGHT)).toBe("2026-11-30");
  });

  it("accepts a value serialised across the RSC boundary", () => {
    expect(deadlineDateIST("2026-11-30T00:00:00.000Z")).toBe("2026-11-30");
  });
});

describe("isDeadlinePassed — open through the whole IST deadline day", () => {
  for (const stored of [STORED_UTC_MIDNIGHT, STORED_IST_MIDNIGHT]) {
    for (const m of MOMENTS) {
      it(`${stored.toISOString()} at ${m.label} → passed=${m.passed}`, () => {
        expect(isDeadlinePassed(stored, new Date(m.now))).toBe(m.passed);
      });
    }
  }
});

describe("isLifecycleClosed follows the same calendar-day rule", () => {
  for (const m of MOMENTS) {
    it(`notification with apply_link at ${m.label} → closed=${m.passed}`, () => {
      expect(
        isLifecycleClosed(
          {
            documentType: "notification",
            statusBadge: "apply_link",
            orderState: "current",
            actionDeadline: STORED_UTC_MIDNIGHT,
          },
          new Date(m.now)
        )
      ).toBe(m.passed);
    });
  }
});

describe("homepage upcoming-dates query bound agrees with isDeadlinePassed", () => {
  for (const m of MOMENTS) {
    it(`at ${m.label} the stored deadline is ${m.passed ? "excluded" : "included"}`, () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(m.now));
      // Mirrors the Prisma filter `actionDeadline: { gte: startOfTodayIST() }`.
      for (const stored of [STORED_UTC_MIDNIGHT, STORED_IST_MIDNIGHT]) {
        expect(stored >= startOfTodayIST()).toBe(!m.passed);
      }
    });
  }
});

describe("article header deadline chip", () => {
  const post = {
    id: "p1",
    slug: "ap-dsc-2026",
    titleEn: "AP DSC 2026",
    titleTe: "ఏపీ డీఎస్సీ 2026",
    content: "<p>body</p>",
    goReference: "Notification No.01/DSC-TRC-1/2026",
    sourceDept: "School Education",
    documentDate: new Date("2026-11-05"),
    createdAt: new Date("2026-11-25"),
    actionDeadline: STORED_UTC_MIDNIGHT,
    verifiedAgainstGoir: false,
    pdfUrl: "https://example.com/doc.pdf",
    sourceUrl: "https://example.com/source",
    actionUrl: null,
    summaryTe: ["డీఎస్సీ నోటిఫికేషన్."],
    englishAbstract: null,
    category: { nameEn: "Notifications", slug: "notifications" },
    relatedFrom: [],
  };
  const view = { kind: "state", state: "current", label: "Current", inForce: true };

  for (const m of MOMENTS) {
    it(`at ${m.label} shows ${m.passed ? "Deadline passed" : "Deadline"}`, () => {
      vi.useFakeTimers({ toFake: ["Date"] });
      vi.setSystemTime(new Date(m.now));
      render(<DocumentTemplate post={post} lifecycleView={view} />);
      if (m.passed) {
        expect(screen.getByText("Deadline passed: 30 Nov 2026")).toBeInTheDocument();
      } else {
        expect(screen.getByText("Deadline: 30 Nov 2026")).toBeInTheDocument();
        expect(screen.queryByText(/Deadline passed/)).not.toBeInTheDocument();
      }
    });
  }
});

import PostFormClient from "@/app/admin/posts/_components/PostFormClient";

describe("admin form round-trips the deadline day", () => {
  const testAction = "/admin/posts/x" as unknown as (formData: FormData) => Promise<void>;
  const initial = (actionDeadline: Date) => ({
    titleEn: "AP DSC 2026",
    titleTe: "ఏపీ డీఎస్సీ 2026",
    summaryTe: ["డీఎస్సీ నోటిఫికేషన్."],
    englishAbstract: null,
    content: null,
    statusBadge: "apply_link",
    pdfUrl: null,
    actionUrl: null,
    actionDeadline,
    documentDate: null,
    goReference: "Notification No.01/DSC-TRC-1/2026",
    sourceDept: null,
    sourceUrl: null,
    categoryId: null,
    documentType: "notification",
    orderState: "current",
    tags: [],
    verifiedAgainstGoir: false,
    relatedPostIds: [],
  });

  for (const stored of [STORED_UTC_MIDNIGHT, STORED_IST_MIDNIGHT]) {
    it(`shows 2026-11-30 for a deadline stored as ${stored.toISOString()}`, () => {
      const { container } = render(
        <PostFormClient
          action={testAction}
          postId="p1"
          initial={initial(stored)}
          categories={[]}
          candidatePosts={[]}
        />
      );
      expect(container.querySelector('input[name="actionDeadline"]')).toHaveValue("2026-11-30");
    });
  }

  it("labels the reference field as a document reference", () => {
    render(<PostFormClient action={testAction} categories={[]} candidatePosts={[]} />);
    expect(screen.getByText("Document reference")).toBeInTheDocument();
    expect(screen.queryByText("GO / Memo Reference")).not.toBeInTheDocument();
  });
});

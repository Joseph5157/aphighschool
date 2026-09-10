// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const prismaMocks = vi.hoisted(() => ({ findMany: vi.fn() }));

vi.mock("@/lib/prisma", () => ({
  prisma: { post: { findMany: prismaMocks.findMany } },
}));
vi.mock("@/app/(public)/_components/DesktopLeftNav", () => ({ default: () => null }));

const HomePage = (await import("@/app/(public)/(home)/page")).default;

type ActionPost = {
  id: string;
  slug: string;
  titleEn: string;
  actionDeadline: Date;
  goReference: string | null;
  sourceDept: string | null;
  verifiedAgainstGoir: boolean;
};

const today = new Date("2026-08-25T00:00:00.000Z");
const past = new Date("2026-08-24T00:00:00.000Z");
const near = new Date("2026-08-26T00:00:00.000Z");
const later = new Date("2026-08-30T00:00:00.000Z");

function actionPost(
  id: string,
  titleEn: string,
  actionDeadline: Date,
  verifiedAgainstGoir = false
): ActionPost {
  return {
    id,
    slug: id,
    titleEn,
    actionDeadline,
    goReference: "G.O.Ms.No.129",
    sourceDept: "School Education, AP",
    verifiedAgainstGoir,
  };
}

let upcomingPosts: ActionPost[] = [];

describe("homepage upcoming action dates", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-25T17:00:00.000Z")); // 22:30 IST
    upcomingPosts = [];
    prismaMocks.findMany.mockImplementation((query: { take: number }) =>
      Promise.resolve(query.take === 4 ? upcomingPosts : [])
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("renders today and future recorded action dates nearest first with only internal document links", async () => {
    const todayPost = actionPost("today-action", "Today action document", today, true);
    const nearPost = actionPost("near-action", "Near action document", near);
    const laterPost = actionPost("later-action", "Later action document", later);
    upcomingPosts = [todayPost, nearPost, laterPost];

    const html = renderToStaticMarkup(await HomePage());

    expect(html).toContain("Upcoming action dates");
    expect(html).toContain("Published documents with a recorded action date. Confirm details in the document.");
    expect(html.indexOf(todayPost.titleEn)).toBeLessThan(html.indexOf(nearPost.titleEn));
    expect(html.indexOf(nearPost.titleEn)).toBeLessThan(html.indexOf(laterPost.titleEn));
    expect(html).toContain(`href="/posts/${todayPost.slug}"`);
    expect(html).not.toMatch(/https?:\/\//);
  });

  it("queries only published action dates from the current IST day onward, nearest first, capped at four", async () => {
    await HomePage();

    expect(prismaMocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          isDraft: false,
          actionDeadline: { gte: new Date("2026-08-24T18:30:00.000Z") },
        },
        orderBy: { actionDeadline: "asc" },
        take: 4,
      })
    );
    expect(prismaMocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isDraft: false }, take: 6 })
    );
    expect(past.getTime()).toBeLessThan(new Date("2026-08-24T18:30:00.000Z").getTime());
  });

  it("omits the section when the query has no qualifying published action dates", async () => {
    const html = renderToStaticMarkup(await HomePage());

    expect(html).not.toContain("Upcoming action dates");
    expect(html).not.toContain("Published documents with a recorded action date.");
  });

  it("shows GOIR Verified only for posts with the recorded verification flag", async () => {
    upcomingPosts = [
      actionPost("verified-action", "Verified action document", near, true),
      actionPost("unverified-action", "Unverified action document", later),
    ];

    const html = renderToStaticMarkup(await HomePage());

    expect(html.match(/GOIR Verified/g)).toHaveLength(1);
  });
});

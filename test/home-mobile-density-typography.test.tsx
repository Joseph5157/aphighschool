import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import fs from "node:fs";
import path from "node:path";
import DateGroupedFeed, { type FeedPost } from "@/app/(public)/_components/DateGroupedFeed";
import PostCard from "@/app/(public)/_components/PostCard";

const post: FeedPost = {
  id: "post-1",
  slug: "teacher-transfer-circular",
  titleEn: "Teacher Transfer Circular and Official Instructions",
  titleTe: "ఉపాధ్యాయ బదిలీల సర్క్యులర్ మరియు అధికారిక సూచనలు",
  statusBadge: "current",
  documentType: "circular",
  orderState: "current",
  goReference: "G.O.Ms.No. 42",
  sourceDept: "School Education Department",
  verifiedAgainstGoir: false,
  createdAt: new Date("2026-08-29T00:00:00.000Z"),
  documentDate: new Date("2026-08-29T00:00:00.000Z"),
  category: {
    nameEn: "Teacher Transfers",
    slug: "teacher-transfers",
    color: "#6f4e37",
    icon: null,
  },
};

describe("mobile home density and typography", () => {
  it("keeps document filters in one horizontally scrollable row", () => {
    render(<DateGroupedFeed posts={[post]} />);

    const filters = screen.getByRole("group", { name: "Filter documents by type" });
    expect(filters).toHaveClass("flex-nowrap", "overflow-x-auto", "no-scrollbar");

    const all = screen.getByRole("button", { name: "All Updates" });
    expect(all).toHaveClass("min-h-[44px]", "font-sans");
    expect(all).not.toHaveClass("font-mono");
    expect(all).toHaveAttribute("aria-pressed", "true");
  });

  it("uses the full card width on mobile and reserves mono for document data", () => {
    const { container } = render(<PostCard post={post} />);

    const desktopCode = container.querySelector(".hidden.sm\\:flex");
    const mobileCode = screen.getAllByText("TT").find((node) => node.classList.contains("sm:hidden"));
    expect(desktopCode).toBeInTheDocument();
    expect(mobileCode).toHaveClass("font-mono");

    expect(screen.getByText("Teacher Transfers")).toHaveClass("font-sans");
    expect(screen.getByText("G.O.Ms.No. 42")).toHaveClass("font-mono");
    expect(screen.getByText(post.titleTe)).toHaveAttribute("lang", "te");
  });

  it("keeps navigation and prose out of the data typeface", () => {
    const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), "utf8");

    expect(read("app/(public)/_components/BottomNav.tsx")).toContain(
      'className="text-xs font-sans font-medium tracking-tight"',
    );
    expect(read("app/(public)/posts/[slug]/_components/ActionSummary.tsx")).not.toContain(
      "text-body italic",
    );
  });
});

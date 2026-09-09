// UI-STATES-1: deliberate loading, empty and error presentation.
//
// Loading treatment is proven structurally (every DB-backed public route has
// a `loading.tsx`, and each one announces itself for assistive tech) rather
// than by rendering Suspense timing, which jsdom cannot observe. Empty states
// are proven behaviourally wherever a real component owns the branch — see
// test/search-ui.test.tsx for SearchUI's own cases. test/category-filter.test.tsx
// only ever exercises non-empty filter results, so the empty branch is covered
// here instead.
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import fs from "node:fs";
import path from "node:path";
import Skeleton from "@/app/(public)/_components/Skeleton";
import EmptyState from "@/app/(public)/_components/EmptyState";
import CategoryLogList from "@/app/(public)/category/[slug]/_components/CategoryLogList";

// Mirrors test/today-attention.test.tsx's mocking shape for the same async
// Server Component: mock prisma directly and render the real page function,
// rather than source-scanning for `<EmptyState`, so a reverted ternary fails
// on an actual missing/present empty state rather than on missing text.
const prismaMocks = vi.hoisted(() => ({ findMany: vi.fn(), categoryFindMany: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    post: { findMany: prismaMocks.findMany },
    category: { findMany: prismaMocks.categoryFindMany },
  },
}));
vi.mock("@/app/(public)/_components/DesktopLeftNav", () => ({ default: () => null }));

const HomePage = (await import("@/app/(public)/page")).default;
const OrdersPage = (await import("@/app/(public)/orders/page")).default;

afterEach(cleanup);

const PUBLIC_DIR = path.join(process.cwd(), "app", "(public)");

function read(relativePath: string): string {
  return fs.readFileSync(path.join(PUBLIC_DIR, relativePath), "utf8");
}

describe("Skeleton", () => {
  it("is decorative — hidden from assistive tech, marked as pulsing", () => {
    const { container } = render(<Skeleton className="h-4 w-24" data-testid="block" />);
    const el = container.firstElementChild!;
    expect(el).toHaveAttribute("aria-hidden", "true");
    expect(el.className).toContain("animate-pulse");
  });
});

describe("EmptyState", () => {
  it("announces itself as a status region and shows the title", () => {
    render(<EmptyState title="No published orders found." />);
    const el = screen.getByRole("status");
    expect(el).toHaveTextContent("No published orders found.");
  });

  it("renders an optional description and action", () => {
    render(
      <EmptyState
        title="No matching documents found."
        description="Try a different keyword."
        action={<a href="/orders">Browse Orders</a>}
      />
    );
    expect(screen.getByText("Try a different keyword.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Browse Orders" })).toHaveAttribute("href", "/orders");
  });

  it("gives compact instances smaller type than the default block", () => {
    const full = render(<EmptyState title="Full" />);
    expect(full.getByRole("status").querySelector("p")!.className).toContain("text-sm");
    full.unmount();

    const compact = render(<EmptyState title="Compact" compact />);
    expect(compact.getByRole("status").querySelector("p")!.className).toContain("text-xs");
  });
});

describe("loading.tsx coverage for DB-backed public routes", () => {
  // UI-AUDIT-1 / UI_CURRENT_STATE.md recorded this as the gap this gate
  // closes: "no route has a loading.tsx". Deleting any one of these files
  // fails this test for the right reason.
  const routes = [
    "loading.tsx",
    "orders/loading.tsx",
    "category/[slug]/loading.tsx",
    "posts/[slug]/loading.tsx",
    "search/loading.tsx",
  ];

  it.each(routes)("%s exists", (relativePath) => {
    expect(fs.existsSync(path.join(PUBLIC_DIR, relativePath))).toBe(true);
  });

  it.each(routes)("%s announces loading to assistive tech and uses Skeleton", (relativePath) => {
    const source = read(relativePath);
    expect(source).toMatch(/role="status"/);
    expect(source).toContain("Skeleton");
  });

  // The routes deliberately left out: /topics, /service-desk, /tools/*, and
  // /pensioners/* render no prisma query at all (confirmed by grep during
  // this gate), so a loading.tsx for them would be decoration with nothing
  // to cover — see UI_ACTIVE_GATE.md's route classification table.
  it("does not add a loading.tsx to a static route", () => {
    for (const staticRoute of ["topics", "service-desk", "tools", "pensioners"]) {
      expect(fs.existsSync(path.join(PUBLIC_DIR, staticRoute, "loading.tsx"))).toBe(false);
    }
  });
});

// SLOP-DENSITY-1 (AI_SLOP_AUDIT.md A06) replaced OrdersFilterTabs — six
// document-type tabs over a grid of category cards, each card holding three
// mini document rows — with one category index and one document list. Those
// two structures owned two empty states each; these are the two the page has
// now. A18 protects the restraint of these states, so they are still asserted
// rather than allowed to quietly disappear with the widgets that held them.
describe("orders index empty states", () => {
  it("shows an empty state when no category exists", async () => {
    prismaMocks.categoryFindMany.mockResolvedValue([]);
    prismaMocks.findMany.mockResolvedValue([]);

    const html = renderToStaticMarkup(await OrdersPage());
    expect(html).toContain("No categories available.");
  });

  it("shows an empty state for the document list while still listing categories", async () => {
    prismaMocks.categoryFindMany.mockResolvedValue([
      {
        id: "cat-1",
        nameEn: "Circulars",
        nameTe: "సర్క్యులర్లు",
        slug: "circulars",
        color: null,
        icon: null,
        _count: { posts: 0 },
      },
    ]);
    prismaMocks.findMany.mockResolvedValue([]);

    const html = renderToStaticMarkup(await OrdersPage());
    expect(html).toContain("No published documents yet.");
    expect(html).toContain("Circulars");
    expect(html).not.toContain("No categories available.");
  });
});

describe("CategoryLogList empty states", () => {
  it("shows an empty state for a genuinely empty category", () => {
    render(<CategoryLogList posts={[]} />);
    expect(screen.getByText('No documents found for "All" filter.')).toBeInTheDocument();
  });

  it("names the active filter in the empty state after switching it", () => {
    const post = {
      id: "p1",
      slug: "p1",
      titleEn: "Sample Order",
      titleTe: "నమూనా ఉత్తర్వు",
      summaryTe: [],
      englishAbstract: null,
      statusBadge: "notification",
      documentType: "go" as const,
      orderState: "current" as const,
      goReference: null,
      actionDeadline: null,
      createdAt: new Date("2026-01-01"),
      documentDate: new Date("2026-01-01"),
      tags: [],
    };
    render(<CategoryLogList posts={[post]} />);
    fireEvent.click(screen.getByRole("tab", { name: "Closed" }));
    expect(screen.getByText('No documents found for "Closed" filter.')).toBeInTheDocument();
  });
});

describe("home page feed", () => {
  it("shows the empty state when there are no published posts", async () => {
    prismaMocks.findMany.mockResolvedValue([]);
    const html = renderToStaticMarkup(await HomePage());
    expect(html).toContain("No published orders found.");
  });

  it("does not show the empty state once a post exists", async () => {
    prismaMocks.findMany.mockImplementation((query: { take: number }) =>
      Promise.resolve(
        query.take === 6
          ? [
              {
                id: "p1",
                slug: "p1",
                titleEn: "PTR Norms Guidelines",
                titleTe: "పిటిఆర్ నిబంధనలు",
                summaryTe: [],
                statusBadge: "notification",
                documentType: "go",
                orderState: "current",
                goReference: null,
                sourceDept: null,
                verifiedAgainstGoir: false,
                createdAt: new Date("2026-01-01"),
                documentDate: new Date("2026-01-01"),
                category: null,
                relatedFrom: [],
              },
            ]
          : []
      )
    );
    const html = renderToStaticMarkup(await HomePage());
    expect(html).not.toContain("No published orders found.");
    expect(html).toContain("PTR Norms Guidelines");
  });
});

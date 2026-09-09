// Responsive and overflow behaviour changed by UI-RESPONSIVE-1.
//
// Layout is the part of this program a jsdom test can say least about: nothing
// here lays out, so nothing here can prove a page does not scroll sideways at
// 320px. What these tests CAN prove is the structural preconditions — how many
// fixed bars mount, whether a container can shrink, whether long unbroken text
// is allowed to wrap — which is where every overflow defect the audit found
// actually came from. The rest is listed for UI-ACCEPTANCE-1.
import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import fs from "node:fs";
import path from "node:path";

vi.mock("next/navigation", () => ({ usePathname: () => "/posts/some-order" }));

import BottomNav from "@/app/(public)/_components/BottomNav";
import ThumbZoneBar from "@/app/(public)/posts/[slug]/_components/ThumbZoneBar";
import PostCard from "@/app/(public)/_components/PostCard";
import { BottomBarProvider } from "@/app/(public)/_components/BottomBarSlot";

const ROOT = process.cwd();

function tsxFiles(dir: string): string[] {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full, { withFileTypes: true }).flatMap((entry) => {
    const p = path.join(dir, entry.name);
    return entry.isDirectory() ? tsxFiles(p) : p.endsWith(".tsx") ? [p] : [];
  });
}

function fixedBottomBars(container: HTMLElement): Element[] {
  return Array.from(container.querySelectorAll("*")).filter((el) => {
    const cls = el.getAttribute("class") ?? "";
    return /(^|\s)fixed(\s|$)/.test(cls) && /(^|\s)bottom-0(\s|$)/.test(cls);
  });
}

describe("audit F1 — stacked bottom bars", () => {
  // Post detail pages mounted BOTH `ThumbZoneBar` (fixed bottom-0; lacked
  // responsive hiding until UI-ACCEPTANCE-1) and `BottomNav` (fixed bottom-0
  // lg:hidden), so below 1024px they occupied the same strip at the same
  // stacking level.
  it("mounts one fixed bottom bar when a page claims the slot", () => {
    const { container } = render(
      <BottomBarProvider>
        <ThumbZoneBar pdfUrl="https://example.test/order.pdf" sourceUrl={null} />
        <BottomNav />
      </BottomBarProvider>,
    );

    expect(fixedBottomBars(container)).toHaveLength(1);
  });

  it("keeps the nav bar on pages that do not claim the slot", () => {
    const { container } = render(
      <BottomBarProvider>
        <BottomNav />
      </BottomBarProvider>,
    );

    // The fix must not simply delete the nav bar everywhere.
    const bars = fixedBottomBars(container);
    expect(bars).toHaveLength(1);
    expect(bars[0].getAttribute("aria-label")).toBe("Primary");
  });

  it("restores the nav bar when the page-level bar unmounts", () => {
    const { container, rerender } = render(
      <BottomBarProvider>
        <ThumbZoneBar pdfUrl="https://example.test/order.pdf" sourceUrl={null} />
        <BottomNav />
      </BottomBarProvider>,
    );
    expect(fixedBottomBars(container)[0].getAttribute("aria-label")).toBe("Document actions");

    rerender(
      <BottomBarProvider>
        <BottomNav />
      </BottomBarProvider>,
    );

    const bars = fixedBottomBars(container);
    expect(bars).toHaveLength(1);
    expect(bars[0].getAttribute("aria-label")).toBe("Primary");
  });

  it("puts both bars on the bottom-bar layer, below the drawer scrim", () => {
    // The scrim is z-50 (Sidebar). A bar above it stays lit and clickable
    // through an overlay meant to disable it.
    for (const element of [
      <ThumbZoneBar key="t" pdfUrl="https://example.test/o.pdf" sourceUrl={null} />,
      <BottomNav key="n" />,
    ]) {
      const { container } = render(<BottomBarProvider>{element}</BottomBarProvider>);
      const bar = fixedBottomBars(container)[0];
      expect(bar.getAttribute("class")).toMatch(/(^|\s)z-45(\s|$)/);
    }
  });

  it("clears the iOS home indicator on every fixed bottom bar", () => {
    for (const element of [
      <ThumbZoneBar key="t" pdfUrl="https://example.test/o.pdf" sourceUrl={null} />,
      <BottomNav key="n" />,
    ]) {
      const { container } = render(<BottomBarProvider>{element}</BottomBarProvider>);
      const bar = fixedBottomBars(container)[0];
      expect(bar.getAttribute("class")).toContain("safe-area-inset-bottom");
    }
  });

  // UI-ACCEPTANCE-1: found via real rendering at 1440px — ThumbZoneBar had no
  // desktop-hiding class, so it floated as a redundant strip on wide desktop
  // layouts (ActionSummary already renders the same pdfUrl/sourceUrl links
  // inline in the page body at every width). BottomNav already got this right.
  it("hides ThumbZoneBar at lg, matching BottomNav's own desktop-hiding convention", () => {
    for (const element of [
      <ThumbZoneBar key="t" pdfUrl="https://example.test/o.pdf" sourceUrl={null} />,
      <BottomNav key="n" />,
    ]) {
      const { container } = render(<BottomBarProvider>{element}</BottomBarProvider>);
      const bar = fixedBottomBars(container)[0];
      expect(bar.getAttribute("class")).toMatch(/(^|\s)lg:hidden(\s|$)/);
    }
  });
});

describe("no page-level horizontal scroll is hidden or caused", () => {
  it("never masks overflow with a global overflow-x-hidden", () => {
    // DESIGN_SYSTEM.md §9.3: hiding it conceals the structural bug instead of
    // fixing it, and silently clips content on the pages that do overflow.
    const offenders: string[] = [];

    for (const file of [...tsxFiles("app"), "app/globals.css"]) {
      const full = path.join(ROOT, file);
      if (!fs.existsSync(full)) continue;
      const source = fs.readFileSync(full, "utf8");
      source.split("\n").forEach((line, index) => {
        if (!/overflow-x-hidden|overflow-x:\s*hidden/.test(line)) return;
        // Allowed on a local container; never on the page shell or body.
        if (/<body|<main|min-h-screen|^body|html/.test(line)) {
          offenders.push(`${file}:${index + 1}`);
        }
      });
    }

    expect(offenders).toEqual([]);
  });

  it("uses no viewport-width or fixed-width utility that can exceed 320px", () => {
    // `w-screen` ignores the scrollbar and overflows by its width; a fixed `w-`
    // wider than the narrowest supported viewport cannot shrink.
    const offenders: string[] = [];

    for (const file of tsxFiles("app")) {
      const source = fs.readFileSync(path.join(ROOT, file), "utf8");
      source.split("\n").forEach((line, index) => {
        if (/(^|\s|")w-screen(\s|"|$)/.test(line)) {
          offenders.push(`${file}:${index + 1} w-screen`);
        }
        for (const match of line.matchAll(/(?<!max-|min-)\bw-\[(\d+)px\]/g)) {
          if (Number(match[1]) > 320) {
            offenders.push(`${file}:${index + 1} ${match[0]}`);
          }
        }
      });
    }

    expect(offenders).toEqual([]);
  });
});

describe("the 768–1023px band uses one navigation breakpoint", () => {
  // UI-SYSTEM-1 unified this: the sidebar switched behaviour in JS at 768 while
  // the tab bar and desktop nav switched in CSS at 1024, so viewports in
  // between got a desktop push-sidebar AND a mobile tab bar at once.
  it("keeps the JS viewport check on lg", async () => {
    const { NAV_BREAKPOINT, BREAKPOINTS } = await import("@/lib/breakpoints");
    expect(NAV_BREAKPOINT).toBe(1024);
    expect(NAV_BREAKPOINT).toBe(BREAKPOINTS.lg);
  });

  it("hides and shows navigation only at lg, never at md", () => {
    const offenders: string[] = [];
    const navFiles = [
      "app/(public)/_components/BottomNav.tsx",
      "app/(public)/_components/DesktopNav.tsx",
      "app/(public)/_components/DesktopLeftNav.tsx",
    ];

    for (const file of navFiles) {
      const source = fs.readFileSync(path.join(ROOT, file), "utf8");
      source.split("\n").forEach((line, index) => {
        // `md:hidden` / `md:block` / `md:flex` on a nav component reintroduces
        // a second breakpoint for the same decision.
        if (/\bmd:(hidden|block|flex|grid)\b/.test(line)) {
          offenders.push(`${file}:${index + 1}`);
        }
      });
    }

    expect(offenders).toEqual([]);
  });

  it("hard-codes no second navigation breakpoint in JS", () => {
    const offenders: string[] = [];

    for (const file of tsxFiles("app")) {
      const source = fs.readFileSync(path.join(ROOT, file), "utf8");
      source.split("\n").forEach((line, index) => {
        if (/innerWidth\s*[<>]=?\s*\d+/.test(line)) {
          offenders.push(`${file}:${index + 1} — use NAV_BREAKPOINT`);
        }
      });
    }

    expect(offenders).toEqual([]);
  });
});

describe("the document row's metadata line wraps instead of overflowing", () => {
  // UI-ACCEPTANCE-1 found this on HeroCard at a real 320px render: the date
  // label and the link beside it don't both fit on one line, and with only
  // `justify-between` (no wrap, no shrink) the second item overflowed its own
  // row by 9px. SLOP-DENSITY-1 deleted HeroCard (AI_SLOP_AUDIT.md A01) and
  // moved the date onto PostCard, which now carries a four-item metadata line
  // — state pill, category/reference, GOIR marker, date — so the same rule
  // has to hold there. jsdom can't measure the overflow, but it can prove the
  // structural precondition a wrap needs.
  it("lets the metadata row wrap onto a second line", () => {
    const { container } = render(
      <PostCard
        post={{
          id: "p1",
          slug: "test-post",
          titleEn: "Title",
          titleTe: "శీర్షిక",
          statusBadge: "current",
          documentType: null,
          orderState: "current",
          goReference: "G.O.Ms.No.129",
          sourceDept: null,
          verifiedAgainstGoir: true,
          createdAt: new Date("2026-01-01"),
          documentDate: null,
          category: { nameEn: "Government Orders", slug: "govt-orders" },
        }}
      />,
    );

    const date = [...container.querySelectorAll("span")].find((s) =>
      s.textContent?.startsWith("Added to portal"),
    );
    const row = date?.parentElement;
    expect(row?.getAttribute("class")).toMatch(/(^|\s)flex-wrap(\s|$)/);
  });
});

describe("intentional horizontal scroll stays reachable", () => {
  // Local scroll is allowed for tables and chip rows (DESIGN_SYSTEM.md §9.3),
  // but a bare overflow-x-auto div scrolls only with a pointer. A keyboard user
  // cannot reach a wide table's right-hand columns at all.
  it("makes every wide-content scroll region focusable", () => {
    const offenders: string[] = [];

    for (const file of tsxFiles("app")) {
      const source = fs.readFileSync(path.join(ROOT, file), "utf8");
      // Only the containers holding wide CONTENT need this. Chip and tab rows
      // scroll too, but every chip is itself a focusable link or button, so
      // keyboard users already reach the far end by tabbing.
      const wide = /min-w-\[\d|<table|<Table\b/;
      source.split("\n").forEach((line, index) => {
        if (!/overflow-x-auto/.test(line)) return;
        const window = source.split("\n").slice(index, index + 6).join("\n");
        if (!wide.test(window)) return;
        if (/tabIndex=\{0\}/.test(window)) return;
        offenders.push(`${file}:${index + 1}`);
      });
    }

    expect(offenders).toEqual([]);
  });
});

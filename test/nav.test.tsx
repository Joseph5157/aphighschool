import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import fs from "node:fs";
import path from "node:path";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

import BottomNav from "@/app/(public)/_components/BottomNav";
import DesktopNav from "@/app/(public)/_components/DesktopNav";

const MOBILE_ALLOWED = ["/", "/orders", "/search", "/tools", "/pensioners"];
const DESKTOP_ALLOWED = ["/", "/orders", "/search", "/tools", "/service-desk", "/pensioners"];

function hrefs() {
  return screen.getAllByRole("link").map((a) => a.getAttribute("href"));
}

describe("public navigation scope", () => {
  it("bottom nav keeps exactly the five mobile destinations", () => {
    render(<BottomNav />);
    const found = hrefs();
    expect(found).toHaveLength(5);
    expect(new Set(found)).toEqual(new Set(MOBILE_ALLOWED));
  });

  it("bottom nav does not link to the education section", () => {
    render(<BottomNav />);
    expect(hrefs()).not.toContain("/education");
  });

  it("desktop nav does not link to the education section", () => {
    render(<DesktopNav />);
    expect(hrefs()).not.toContain("/education");
  });

  it("desktop nav includes Teacher Services among in-scope destinations", () => {
    render(<DesktopNav />);
    const found = hrefs();
    expect(found).toHaveLength(6);
    expect(new Set(found)).toEqual(new Set(DESKTOP_ALLOWED));
  });

  it("drawer navigation includes Teacher Services", () => {
    const layout = fs.readFileSync(path.join(process.cwd(), "app/(public)/layout.tsx"), "utf8");
    expect(layout).toContain('<SidebarMenuButton href="/service-desk">Teacher Services</SidebarMenuButton>');
  });

  // NAV-FIX-1: DesktopNav and the drawer previously labelled the same
  // /service-desk destination differently. Asserting the label on both
  // surfaces is what actually guards consistency — checking only one surface
  // would pass even if they drifted apart again.
  it("labels the Teacher Services destination identically on the desktop nav and the drawer", () => {
    render(<DesktopNav />);
    const desktopLabel = screen.getByRole("link", { name: "Teacher Services" });
    expect(desktopLabel).toHaveAttribute("href", "/service-desk");

    const layout = fs.readFileSync(path.join(process.cwd(), "app/(public)/layout.tsx"), "utf8");
    expect(layout).toContain('<SidebarMenuButton href="/service-desk">Teacher Services</SidebarMenuButton>');
    expect(layout).not.toMatch(/Teacher Service Desk|>Service Desk</);
  });

  // TERM-LABELS-1 (docs/context/TERM_NAV_1_PLAN.md §5): routes and order are
  // fixed; only the visible words changed. Each surface is checked as an
  // ordered [href, label] list so a renamed, reordered or re-routed entry
  // fails rather than slipping through a set comparison.
  describe("TERM-LABELS-1 teacher terminology", () => {
    it("bottom nav reads Home · GOs · Search · Tools · Pension in that order", () => {
      render(<BottomNav />);
      const pairs = screen.getAllByRole("link").map((a) => [a.getAttribute("href"), a.textContent]);
      expect(pairs).toEqual([
        ["/", "Home"],
        ["/orders", "GOs"],
        ["/search", "Search"],
        ["/tools", "Tools"],
        ["/pensioners", "Pension"],
      ]);
    });

    it("gives the compact GOs item a full accessible name that starts with its visible word", () => {
      render(<BottomNav />);
      const gos = screen.getByRole("link", { name: "GOs, Proceedings and Memos" });
      expect(gos).toHaveAttribute("href", "/orders");
      // Only GOs is abbreviated; the other four keep their visible text as name.
      expect(screen.getAllByRole("link").filter((a) => a.hasAttribute("aria-label"))).toHaveLength(1);
    });

    const DESKTOP_ORDER = [
      ["/", "Home"],
      ["/orders", "GOs & Proceedings"],
      ["/tools", "Teacher Tools"],
      ["/service-desk", "Teacher Services"],
      ["/pensioners", "Pension & Retirement"],
      ["/search", "Search"],
    ];

    it("desktop nav uses the long labels in the unchanged order", () => {
      render(<DesktopNav />);
      const pairs = screen.getAllByRole("link").map((a) => [a.getAttribute("href"), a.textContent]);
      expect(pairs).toEqual(DESKTOP_ORDER);
    });

    // PR #5 review: site-wide metadata still carried "Living Document Portal"
    // and "Orders & Circulars". The PWA manifest name is deliberately not
    // covered — renaming an installed app is a separate decision.
    it("site-wide metadata uses the teacher terminology, not the retired phrases", () => {
      const root = fs.readFileSync(path.join(process.cwd(), "app/layout.tsx"), "utf8");
      const publicLayout = fs.readFileSync(path.join(process.cwd(), "app/(public)/layout.tsx"), "utf8");
      expect(root).toContain('description: "AP School Education GOs, Proceedings and teacher updates"');
      expect(publicLayout).toContain('default: "AP Teacher Desk — AP School Education GOs & Proceedings"');
      for (const src of [root, publicLayout]) {
        expect(src).not.toMatch(/Living Document|Orders & Circulars/);
      }
    });

    it("drawer uses the same long labels in the same order as the desktop nav", () => {
      const layout = fs.readFileSync(path.join(process.cwd(), "app/(public)/layout.tsx"), "utf8");
      const block = layout.slice(layout.indexOf("<SidebarMobileOnly>"), layout.indexOf("</SidebarMobileOnly>"));
      const pairs = [...block.matchAll(/<SidebarMenuButton href="([^"]+)">([^<]+)<\/SidebarMenuButton>/g)].map(
        (m) => [m[1], m[2]],
      );
      expect(pairs).toEqual(DESKTOP_ORDER);
    });
  });

  // NAV-SIDEBAR-2: the desktop persistent sidebar duplicated all six primary
  // destinations already owned by DesktopNav, visible in the same viewport at
  // once (NAV-SIDEBAR-1). SidebarMobileOnly is what keeps them in the drawer
  // only; this asserts layout.tsx actually places the real six links inside
  // that wrapper (not just that the wrapper exists somewhere), and that the
  // eight Teacher Utilities deep links sit outside it, so both surfaces keep
  // getting them.
  describe("desktop sidebar carries no duplicated primary links", () => {
    const PRIMARY_HREFS = ["/", "/orders", "/tools", "/service-desk", "/pensioners", "/search"];
    const DEEP_LINK_HREFS = [
      "/tools/tax-calculator",
      "/tools/leave-encashment",
      "/tools/gpf-apgli",
      "/tools/cfms-checker",
      "/tools/prc-calculator",
      "/pensioners/pension-calculator",
      "/pensioners/commutation-tracker",
      "/pensioners/office-pipeline",
    ];

    function mobileOnlyBlock(layout: string): string {
      const start = layout.indexOf("<SidebarMobileOnly>");
      const end = layout.indexOf("</SidebarMobileOnly>");
      expect(start, "layout.tsx must wrap the primary nav group in <SidebarMobileOnly>").toBeGreaterThan(-1);
      expect(end).toBeGreaterThan(start);
      return layout.slice(start, end);
    }

    it("keeps all six primary destinations inside SidebarMobileOnly", () => {
      const layout = fs.readFileSync(path.join(process.cwd(), "app/(public)/layout.tsx"), "utf8");
      const block = mobileOnlyBlock(layout);
      for (const href of PRIMARY_HREFS) {
        expect(block, href).toContain(`href="${href}"`);
      }
    });

    it("keeps all eight deep links outside SidebarMobileOnly, so both surfaces render them", () => {
      const layout = fs.readFileSync(path.join(process.cwd(), "app/(public)/layout.tsx"), "utf8");
      const block = mobileOnlyBlock(layout);
      for (const href of DEEP_LINK_HREFS) {
        expect(block, href).not.toContain(`href="${href}"`);
        expect(layout, href).toContain(`href="${href}"`);
      }
    });
  });
});

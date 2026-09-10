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

  it("desktop nav includes the Service Desk among in-scope destinations", () => {
    render(<DesktopNav />);
    const found = hrefs();
    expect(found).toHaveLength(6);
    expect(new Set(found)).toEqual(new Set(DESKTOP_ALLOWED));
  });

  it("drawer navigation includes Service Desk", () => {
    const layout = fs.readFileSync(path.join(process.cwd(), "app/(public)/layout.tsx"), "utf8");
    expect(layout).toContain('href="/service-desk"');
    expect(layout).toContain("Service Desk");
  });

  // NAV-FIX-1: DesktopNav and the drawer previously labelled the same
  // /service-desk destination differently ("Service Desk" vs "Teacher Service
  // Desk"). Asserting both label strings directly, on both surfaces, is what
  // actually guards consistency — checking only one surface would pass even if
  // they drifted apart again.
  it("labels the Service Desk destination identically on the desktop nav and the drawer", () => {
    render(<DesktopNav />);
    const desktopLabel = screen.getByRole("link", { name: "Service Desk" });
    expect(desktopLabel).toHaveAttribute("href", "/service-desk");

    const layout = fs.readFileSync(path.join(process.cwd(), "app/(public)/layout.tsx"), "utf8");
    expect(layout).not.toContain("Teacher Service Desk");
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

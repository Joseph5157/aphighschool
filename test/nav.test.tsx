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

  it("drawer navigation includes the Teacher Service Desk", () => {
    const layout = fs.readFileSync(path.join(process.cwd(), "app/(public)/layout.tsx"), "utf8");
    expect(layout).toContain('href="/service-desk"');
    expect(layout).toContain("Teacher Service Desk");
  });
});

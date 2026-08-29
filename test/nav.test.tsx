import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

import BottomNav from "@/app/(public)/_components/BottomNav";
import DesktopNav from "@/app/(public)/_components/DesktopNav";

const ALLOWED = ["/", "/orders", "/search", "/tools", "/pensioners"];

function hrefs() {
  return screen.getAllByRole("link").map((a) => a.getAttribute("href"));
}

describe("public navigation scope", () => {
  it("bottom nav exposes exactly the five allowed destinations", () => {
    render(<BottomNav />);
    const found = hrefs();
    expect(found).toHaveLength(5);
    expect(new Set(found)).toEqual(new Set(ALLOWED));
  });

  it("bottom nav does not link to the education section", () => {
    render(<BottomNav />);
    expect(hrefs()).not.toContain("/education");
  });

  it("desktop nav does not link to the education section", () => {
    render(<DesktopNav />);
    expect(hrefs()).not.toContain("/education");
  });

  it("desktop nav links only to in-scope destinations", () => {
    render(<DesktopNav />);
    const found = hrefs();
    expect(found).toHaveLength(5);
    expect(new Set(found)).toEqual(new Set(ALLOWED));
  });
});

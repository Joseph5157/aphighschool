// NAV-SIDEBAR-WIDTH-1: the desktop "Public Quick Menu" used to push the whole
// layout sideways (up to 256px) whenever opened, measured to collide with
// DesktopNav at 1024-1280px and to shrink the reading column at every width.
// It's now a compact, non-modal popover that never participates in page
// layout. These tests guard the two things that could silently regress: the
// container never being layout-affecting (`fixed` positioning, not part of
// the flex row), and its open/close/focus contract (Escape, outside click,
// focus-in, focus-return) actually working.
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/app/(public)/_components/Sidebar";

/** jsdom reports 1024 by default, which is already desktop (>= NAV_BREAKPOINT). */
function setViewport(width: number) {
  Object.defineProperty(window, "innerWidth", { value: width, writable: true, configurable: true });
}

function Shell() {
  return (
    <SidebarProvider defaultOpen={false}>
      {/* SidebarTrigger lives in the page header in production, outside
          <Sidebar> — mirrored here, since DesktopPopoverPanel (unlike the
          old push <aside>) doesn't render at all while closed, and the
          trigger must stay visible regardless of open state. */}
      <SidebarTrigger />
      <Sidebar side="left" desktopVariant="popover">
        <SidebarHeader>
          <span>Public Quick Menu</span>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Teacher Utilities</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton href="/tools/tax-calculator">Income Tax Calculator</SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton href="/pensioners/pension-calculator">Pension Calculator</SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <span>AP Teacher Desk — Independent &amp; Unofficial</span>
        </SidebarFooter>
      </Sidebar>
      <main>page content</main>
    </SidebarProvider>
  );
}

const trigger = () => screen.getByRole("button", { name: /navigation menu/i });
const panel = () => screen.queryByRole("dialog", { name: "Quick links" });

describe("desktop quick-links popover", () => {
  it("does not render until opened, and is not present in the closed state", () => {
    setViewport(1280);
    render(<Shell />);
    expect(panel()).not.toBeInTheDocument();
  });

  it("is fixed-positioned, not part of the page's layout flow", async () => {
    setViewport(1280);
    const user = userEvent.setup();
    render(<Shell />);

    await user.click(trigger());

    const dialog = panel();
    expect(dialog).toBeInTheDocument();
    // The whole point: a `fixed` element is removed from normal flow, so it
    // cannot push a sibling's width regardless of its own width. The old
    // push <aside> used `sticky` + a width class inside the same flex row as
    // the content column — this guards that this container never regresses
    // back to that shape.
    expect(dialog!.className).toContain("fixed");
    expect(dialog!).toHaveAttribute("aria-modal", "false");
  });

  it("opens on a real click, containing the deep links, and closes on Escape with focus returned", async () => {
    setViewport(1280);
    const user = userEvent.setup();
    render(<Shell />);

    await user.click(trigger());
    expect(panel()).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Income Tax Calculator" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Pension Calculator" })).toBeVisible();

    // Focus enters the popover on open.
    expect(panel()!.contains(document.activeElement)).toBe(true);

    await user.keyboard("{Escape}");
    expect(panel()).not.toBeInTheDocument();
    expect(document.activeElement).toBe(trigger());
  });

  it("closes on an outside click", async () => {
    setViewport(1280);
    const user = userEvent.setup();
    render(<Shell />);

    await user.click(trigger());
    expect(panel()).toBeInTheDocument();

    await user.click(screen.getByText("page content"));
    expect(panel()).not.toBeInTheDocument();
  });

  it("does not close from the same click that opened it", async () => {
    setViewport(1280);
    const user = userEvent.setup();
    render(<Shell />);

    await user.click(trigger());
    expect(panel()).toBeInTheDocument();
  });
});

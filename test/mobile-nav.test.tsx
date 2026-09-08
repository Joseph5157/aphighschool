// Audit F5: the off-canvas drawer was a panel translated off-screen and nothing
// else — no Escape, no focus trap, no focus return, no body scroll lock, and no
// inertness, so Tab from the header walked into an invisible menu.
//
// One test per behaviour the gate checklist names, so a regression says which
// behaviour broke rather than "the drawer test failed".
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

let mockPathname = "/";
vi.mock("next/navigation", () => ({ usePathname: () => mockPathname }));

import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/app/(public)/_components/Sidebar";

/** jsdom reports 1024 by default, which is desktop. Below NAV_BREAKPOINT. */
function setViewport(width: number) {
  Object.defineProperty(window, "innerWidth", { value: width, writable: true, configurable: true });
}

function Shell() {
  return (
    <SidebarProvider defaultOpen={false}>
      <Sidebar side="left" collapsible="offcanvas">
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="/">Home</SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/orders">Orders</SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarTrigger />
      <a href="/outside">outside the drawer</a>
    </SidebarProvider>
  );
}

const drawer = () => screen.getByRole("dialog", { hidden: true });
const trigger = () => screen.getByRole("button", { name: /navigation menu/i });

beforeEach(() => {
  mockPathname = "/";
  setViewport(390);
});

afterEach(() => {
  document.body.style.overflow = "";
});

describe("opening and closing", () => {
  it("starts closed and inert", () => {
    render(<Shell />);

    expect(drawer()).toHaveAttribute("inert");
    // visibility:hidden is what actually removes it from the tab order; the
    // inert attribute is the belt-and-braces half jsdom can observe.
    expect(drawer().className).toContain("invisible");
  });

  it("opens from the trigger", async () => {
    const user = userEvent.setup();
    render(<Shell />);

    await user.click(trigger());

    expect(drawer()).not.toHaveAttribute("inert");
    expect(drawer().className).toContain("visible");
  });

  it("closes from the trigger", async () => {
    const user = userEvent.setup();
    render(<Shell />);

    await user.click(trigger());
    await user.click(trigger());

    expect(drawer()).toHaveAttribute("inert");
  });

  it("tells assistive tech whether the menu is open", async () => {
    const user = userEvent.setup();
    render(<Shell />);

    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger());
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
  });
});

describe("dismissal", () => {
  it("closes on Escape", async () => {
    const user = userEvent.setup();
    render(<Shell />);
    await user.click(trigger());

    await user.keyboard("{Escape}");

    expect(drawer()).toHaveAttribute("inert");
  });

  it("closes on outside interaction with the scrim", async () => {
    const user = userEvent.setup();
    const { container } = render(<Shell />);
    await user.click(trigger());

    await user.click(container.querySelector('[aria-hidden="true"].fixed')!);

    expect(drawer()).toHaveAttribute("inert");
  });

  it("closes when the route changes from anywhere on the page", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Shell />);
    await user.click(trigger());
    expect(drawer()).not.toHaveAttribute("inert");

    // A card link elsewhere navigated. Previously only the drawer's OWN links
    // closed it, so it stayed open over the new page.
    mockPathname = "/orders";
    rerender(<Shell />);

    expect(drawer()).toHaveAttribute("inert");
  });
});

describe("focus handling", () => {
  it("moves focus into the drawer on open", async () => {
    const user = userEvent.setup();
    render(<Shell />);

    await user.click(trigger());

    expect(drawer().contains(document.activeElement)).toBe(true);
  });

  it("returns focus to the trigger on close", async () => {
    const user = userEvent.setup();
    render(<Shell />);
    const button = trigger();

    await user.click(button);
    await user.keyboard("{Escape}");

    expect(document.activeElement).toBe(button);
  });

  it("keeps Tab inside the drawer while it is open", async () => {
    const user = userEvent.setup();
    render(<Shell />);
    await user.click(trigger());

    for (let i = 0; i < 5; i++) {
      await user.tab();
      expect(drawer().contains(document.activeElement)).toBe(true);
    }
  });
});

describe("scroll locking", () => {
  it("locks body scroll while open and restores it on close", async () => {
    const user = userEvent.setup();
    render(<Shell />);

    await user.click(trigger());
    expect(document.body.style.overflow).toBe("hidden");

    await user.keyboard("{Escape}");
    expect(document.body.style.overflow).not.toBe("hidden");
  });
});

describe("semantics and targets", () => {
  it("names the drawer as a modal surface", () => {
    render(<Shell />);
    const panel = drawer();

    expect(panel).toHaveAttribute("aria-modal", "true");
    expect(panel).toHaveAccessibleName("Site navigation");
  });

  it("marks the active route", async () => {
    mockPathname = "/orders";
    const user = userEvent.setup();
    render(<Shell />);
    await user.click(trigger());

    const active = screen.getByRole("link", { name: "Orders" });
    expect(active).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current");
  });

  it("gives every drawer row a 44px touch target", async () => {
    const user = userEvent.setup();
    render(<Shell />);
    await user.click(trigger());

    for (const link of screen.getAllByRole("link", { name: /home|orders/i })) {
      expect(link.className).toContain("min-h-[44px]");
    }
  });
});

describe("responsive transition", () => {
  it("does not reopen the drawer after a round trip through desktop", async () => {
    const user = userEvent.setup();
    render(<Shell />);
    await user.click(trigger());
    expect(drawer()).not.toHaveAttribute("inert");

    // The round trip is the whole point. Asserting only that the drawer is gone
    // at desktop width proves nothing: `Sidebar` renders the desktop aside
    // instead, so the drawer unmounts whether or not its open state was reset.
    // A mutation removing the reset survived that version of this test.
    setViewport(1280);
    await act(async () => {
      window.dispatchEvent(new Event("resize"));
    });
    expect(screen.queryByRole("dialog", { hidden: true })).toBeNull();

    setViewport(390);
    await act(async () => {
      window.dispatchEvent(new Event("resize"));
    });

    // Back on a phone, the menu must be shut — not reopened from stale state.
    expect(drawer()).toHaveAttribute("inert");
  });
});

describe("the Ctrl/Cmd+B shortcut", () => {
  it("toggles the menu", async () => {
    const user = userEvent.setup();
    render(<Shell />);

    await user.keyboard("{Control>}b{/Control}");

    expect(drawer()).not.toHaveAttribute("inert");
  });

  it("does not steal the keystroke from a text field", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Shell />
        <input aria-label="search" />
      </>,
    );

    const input = screen.getByLabelText("search");
    input.focus();
    await user.keyboard("{Control>}b{/Control}");

    // Previously this fired unconditionally, so Ctrl+B while typing opened the
    // menu AND suppressed the browser's own shortcut.
    expect(drawer()).toHaveAttribute("inert");
  });
});

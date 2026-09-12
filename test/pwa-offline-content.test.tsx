// PWA-OFFLINE-UX-1. The reusable offline state shown when a NETWORK_ONLY
// document navigation fails offline (see app/sw.ts). This component itself
// must stay safe to precache and correct with zero network access — no data
// fetching, no query-parameter-driven redirect target.
import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import fs from "node:fs";
import path from "node:path";
import OfflineContent from "@/app/(public)/offline/_components/OfflineContent";

afterEach(cleanup);

const source = fs.readFileSync(
  path.join(process.cwd(), "app", "(public)", "offline", "_components", "OfflineContent.tsx"),
  "utf8"
);

describe("OfflineContent", () => {
  it("states plainly that the user is offline, with a semantic heading", () => {
    render(<OfflineContent />);
    expect(screen.getByRole("heading", { level: 1, name: /you're offline/i })).toBeInTheDocument();
  });

  it("does not claim the whole app works offline or that government data was downloaded", () => {
    render(<OfflineContent />);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/entire app|whole (site|app) works offline|downloaded/i);
  });

  it("says calculators remain available, not as color alone", () => {
    render(<OfflineContent />);
    // Text conveys the status; nothing here should depend on reading a colour.
    expect(screen.getByText(/calculators are still available offline/i)).toBeInTheDocument();
  });

  it("offers a direct, real navigation to /tools rather than a client-side transition", () => {
    render(<OfflineContent />);
    const link = screen.getByRole("link", { name: /open utility tools/i });
    expect(link).toHaveAttribute("href", "/tools");
  });

  it("does not import next/link — a plain <a> avoids a client-router/URL mismatch on this page", () => {
    // This page can be served under a URL that does not match it (the
    // browser's address bar keeps showing the route that actually failed,
    // e.g. /orders, while this component's markup is what renders — see the
    // file's own header comment). Next's client router keys off the route it
    // believes it rendered, so a client-side <Link> transition risks
    // reconciling against the wrong page. A full navigation sidesteps that.
    expect(source).not.toMatch(/from ["']next\/link["']/);
  });

  it("retries via a same-document reload — there is no URL parameter to redirect through", () => {
    // A Fetch API response substituted via respondWith() does not change the
    // request's URL, so the browser is already at the route the reader
    // wanted (e.g. /orders) when this page's markup is shown. Reloading the
    // current location re-requests exactly that, live if the network is
    // back — with no query string, no stored "return to" value, and
    // therefore nothing an attacker could point off-origin.
    expect(source).not.toMatch(/location\.href\s*=/);
    expect(source).not.toMatch(/searchParams|useSearchParams|redirect_?to|returnTo|next=/i);
    expect(source).toMatch(/window\.location\.reload\(\)/);
  });

  it("the retry action is a real, keyboard-accessible button", async () => {
    const user = userEvent.setup();
    const reload = vi.fn();
    Object.defineProperty(window, "location", {
      value: { ...window.location, reload },
      writable: true,
    });

    render(<OfflineContent />);
    const button = screen.getByRole("button", { name: /try again/i });
    button.focus();
    expect(button).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("the two actions are distinguishable by more than colour (different variants/roles)", () => {
    render(<OfflineContent />);
    const link = screen.getByRole("link", { name: /open utility tools/i });
    const button = screen.getByRole("button", { name: /try again/i });
    // Different element types/roles is itself a non-colour distinction; also
    // confirm they don't share an identical className (i.e. one isn't just a
    // recoloured copy of the other with no other signal).
    expect(link.className).not.toBe(button.className);
  });
});

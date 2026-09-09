// Dialog replaces the hand-rolled admin modal and fills the gap left when
// Sheet.tsx was deleted in UI-SYSTEM-1. Sheet had a <div onClick> trigger, no
// role, no accessible name, no Escape, no focus trap, no focus return and no
// scroll lock — so restoring it was never the right move. These tests pin the
// behaviour that made it worth writing a replacement instead.
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React, { useState } from "react";
import Dialog from "@/app/(public)/_components/Dialog";

function Harness({ onClose }: { onClose?: () => void } = {}) {
  const [open, setOpen] = useState(true);
  return (
    <>
      <button type="button">outside</button>
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          onClose?.();
        }}
        title="Paste JSON Draft"
        footer={<button type="button">Load</button>}
      >
        <input aria-label="draft" />
      </Dialog>
    </>
  );
}

describe("Dialog semantics", () => {
  it("is a modal dialog named by its title", () => {
    render(<Harness />);
    const dialog = screen.getByRole("dialog");

    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleName("Paste JSON Draft");
  });

  it("renders nothing when closed", () => {
    render(
      <Dialog open={false} onClose={() => {}} title="Paste JSON Draft">
        <input aria-label="draft" />
      </Dialog>,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    // Not merely hidden: the content must leave the tab order entirely.
    expect(screen.queryByLabelText("draft")).not.toBeInTheDocument();
  });

  it("gives its close control an accessible name", () => {
    render(<Harness />);
    expect(screen.getByRole("button", { name: "Close dialog" })).toBeInTheDocument();
  });
});

describe("Dialog behaviour", () => {
  it("closes on Escape", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<Harness onClose={onClose} />);

    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes when the scrim is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<Harness onClose={onClose} />);

    await user.click(container.querySelector('[aria-hidden="true"]')!);

    expect(onClose).toHaveBeenCalled();
  });

  it("moves focus into the dialog on open", () => {
    render(<Harness />);
    const dialog = screen.getByRole("dialog");

    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it("returns focus to the trigger on close", async () => {
    const user = userEvent.setup();

    function TriggerHarness() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Paste JSON
          </button>
          <Dialog open={open} onClose={() => setOpen(false)} title="Paste JSON Draft">
            <input aria-label="draft" />
          </Dialog>
        </>
      );
    }

    render(<TriggerHarness />);
    const trigger = screen.getByRole("button", { name: "Paste JSON" });

    await user.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    // Without this, dismissing drops the user at the top of the document.
    expect(document.activeElement).toBe(trigger);
  });

  it("keeps Tab inside the dialog", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const dialog = screen.getByRole("dialog");

    // Enough tabs to walk past every control in the dialog and, without a trap,
    // out into the "outside" button behind the scrim.
    for (let i = 0; i < 6; i++) {
      await user.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
  });

  it("locks body scroll while open and restores it on close", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    expect(document.body.style.overflow).toBe("hidden");

    await user.keyboard("{Escape}");

    expect(document.body.style.overflow).not.toBe("hidden");
  });

  // UI-21DEV-1, DESIGN_SYSTEM.md §1: "Mono is not for body copy, headings, or
  // navigation labels." The title is this dialog's one heading and its
  // accessible name (aria-labelledby) — the same role a page h1 plays, which
  // UI-IMPECCABLE-1 already fixed this rule for on three routes.
  it("does not style its title heading with font-mono", () => {
    render(<Harness />);
    expect(screen.getByRole("heading", { name: "Paste JSON Draft" }).className).not.toMatch(/font-mono/);
  });
});

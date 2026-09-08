"use client";

import React, { useCallback, useEffect, useRef } from "react";
import IconButton from "./IconButton";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  /** Rendered as the dialog's heading and used as its accessible name. */
  title: string;
  children: React.ReactNode;
  /** Footer actions, rendered on a divided row under the content. */
  footer?: React.ReactNode;
  className?: string;
}

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * A modal dialog.
 *
 * `Sheet.tsx` was deleted in UI-SYSTEM-1 as unused, which left the product with
 * one hand-rolled modal (the admin JSON-paste form) that had none of the
 * behaviour a dialog needs: no `role`, no `aria-modal`, no accessible name, no
 * Escape, no focus trap, no focus return, no scroll lock, and an unlabelled `✕`
 * close. This is the replacement, built to DESIGN_SYSTEM.md §8.5 rather than
 * restored from the component that already failed those rules.
 *
 * Deliberately not a portal: the dialog is `fixed` and sits above every layer
 * in the z-scale (§7.2), and adding a portal would mean managing a mount point
 * for the single consumer that exists.
 */
export function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
  className = "",
}: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const titleId = React.useId();

  const focusable = useCallback(
    () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [],
      ).filter((el) => el.offsetParent !== null || el === document.activeElement),
    [],
  );

  // Remember where focus came from, move it into the dialog, and put it back on
  // close. Without the return step a keyboard user is dropped at the top of the
  // document every time they dismiss the dialog.
  useEffect(() => {
    if (!open) return;

    returnFocusRef.current = document.activeElement as HTMLElement | null;
    const first = focusable()[0] ?? panelRef.current;
    first?.focus();

    return () => {
      returnFocusRef.current?.focus?.();
    };
  }, [open, focusable]);

  // Lock body scroll. The scrim hides the page but does not stop it scrolling
  // underneath, which on a phone reads as the dialog itself moving.
  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      // Trap: without this, Tab walks out of the dialog and into the page
      // behind the scrim, where the user cannot see what is focused.
      const items = focusable();
      if (items.length === 0) {
        event.preventDefault();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === panelRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [open, onClose, focusable]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative w-full max-w-lg overflow-hidden rounded-xl border border-hair bg-paperRaised shadow-md ${className}`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-hair px-5 py-3">
          <h2 id={titleId} className="font-mono text-sm font-semibold uppercase text-ink">
            {title}
          </h2>
          <IconButton
            label="Close dialog"
            onClick={onClose}
            icon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            }
          />
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-hair px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dialog;

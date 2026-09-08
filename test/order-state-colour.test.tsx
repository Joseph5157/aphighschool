// UI-AUDIT-1's most consequential visual finding: `superseded` — an order a
// later order has REPLACED — rendered in the same green family as `current`,
// because Badge had no red-family variant and lifecyclePill.ts fell back to
// `tamarind`. A teacher scanning a list saw green and read "fine".
//
// The colour is only half of it. DESIGN_SYSTEM.md §2.4 requires that no status
// is carried by colour alone, so the word is asserted too — a future change
// that keeps the colour right while dropping the label would still be a defect.
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import type { OrderState } from "@prisma/client";
import React from "react";
import Badge from "@/app/(public)/_components/Badge";
import OrderStateBadge from "@/app/(public)/_components/OrderStateBadge";
import { ORDER_STATE_VARIANT } from "@/app/(public)/_components/lifecyclePill";

const IN_FORCE: OrderState[] = ["current", "amended"];
const SPENT: OrderState[] = ["superseded", "archived"];

function classesFor(state: OrderState): string {
  const { container } = render(
    <OrderStateBadge state={state} label={state} />,
  );
  const badge = container.querySelector("span.inline-flex");
  return badge?.className ?? "";
}

describe("order state colour", () => {
  it("does not render superseded in the in-force colour family", () => {
    const superseded = classesFor("superseded");

    expect(superseded).toContain("kumkum");
    // The specific regression: tamarind is what `current` uses for "in force".
    expect(superseded).not.toContain("tamarind");
    expect(superseded).not.toContain("emerald");
  });

  it("gives current and superseded visibly different colour families", () => {
    // A mapping that collapsed every state onto one variant would satisfy the
    // negative assertion above while destroying the distinction entirely.
    const current = classesFor("current");
    const superseded = classesFor("superseded");

    expect(current).not.toEqual(superseded);
    expect(current).toContain("tamarind");
  });

  it("keeps every order state on a distinct variant", () => {
    const variants = ([...IN_FORCE, ...SPENT] as OrderState[]).map(
      (state) => ORDER_STATE_VARIANT[state],
    );

    expect(new Set(variants).size).toBe(variants.length);
  });

  it("states the status in words, not only in colour", () => {
    for (const state of [...IN_FORCE, ...SPENT]) {
      const { container } = render(
        <OrderStateBadge state={state} label={state} />,
      );
      // Both the label and a plain-language explanation of what it means.
      expect(container.textContent).toContain(state);
      expect(container.textContent).toMatch(/force|amended|replaced|Historical/);
    }
  });
});

describe("badge palette", () => {
  const VARIANTS = [
    "tamarind",
    "turmeric",
    "kumkum",
    "neutral",
    "ink",
  ] as const;

  it("uses project tokens, never Tailwind's default palette", () => {
    // AGENTS.md forbids raw default-palette colours. `success` and `warning`
    // used `emerald-*` and `amber-*`, which also never flipped in dark mode —
    // on "GOIR Verified" and "Current", the two most trust-bearing markers in
    // the product.
    const offenders: string[] = [];

    for (const variant of VARIANTS) {
      const { container } = render(
        <Badge variant={variant} dot>
          label
        </Badge>,
      );
      const className = container.querySelector("span")?.className ?? "";
      const dotClassName =
        container.querySelectorAll("span")[1]?.className ?? "";

      const raw =
        /\b(?:emerald|amber|red|blue|green|gray|grey|slate|zinc|neutral-\d|stone|orange|yellow|lime|teal|cyan|sky|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/;
      if (raw.test(className)) offenders.push(`${variant}: ${className}`);
      if (raw.test(dotClassName)) offenders.push(`${variant} dot: ${dotClassName}`);
    }

    expect(offenders).toEqual([]);
  });

  it("renders no badge text below the 12px floor", () => {
    const offenders: string[] = [];

    for (const size of ["sm", "md", "lg"] as const) {
      const { container } = render(
        <Badge size={size}>label</Badge>,
      );
      const className = container.querySelector("span")?.className ?? "";
      // `text-[9px]` / `text-[10px]` were the shipped sizes; `sm` is the
      // default and therefore the most used.
      const arbitrary = className.match(/text-\[(\d+(?:\.\d+)?)px\]/);
      if (arbitrary && Number(arbitrary[1]) < 12) {
        offenders.push(`${size}: ${arbitrary[0]}`);
      }
    }

    expect(offenders).toEqual([]);
  });
});

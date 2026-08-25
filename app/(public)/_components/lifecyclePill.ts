import type { OrderState } from "@prisma/client";
import { resolveLifecycle, type LifecycleInput } from "@/lib/posts/lifecycle";

export type BadgeVariant = "success" | "turmeric" | "tamarind" | "neutral";

// The R16 order-state mapping, stated once. OrderStateBadge (the full-width
// detail-page block) and every card surface read it from here.
//
// Badge has no `kumkum` variant today, so `superseded` uses `tamarind` — the
// nearest existing red-family variant. It cannot fall back to `neutral`: that
// is already `archived`, and the two states would render identically. Adding a
// real `kumkum` Badge token is a Milestone F item.
export const ORDER_STATE_VARIANT: Record<OrderState, BadgeVariant> = {
  current: "success",
  amended: "turmeric",
  superseded: "tamarind",
  archived: "neutral",
};

// Recruitment labels and variants stay per-surface on purpose: the three cards
// genuinely disagree (CategoryLogList is Title Case, and each surface tints the
// same stage differently against its own background). Only the gate — "does
// this document have an application lifecycle at all" — is shared, and it is
// delegated to resolveLifecycle so there is no second, parallel rule.
export type RecruitmentPill = {
  labels: Record<string, string>;
  variants: Record<string, BadgeVariant>;
  fallbackVariant: BadgeVariant;
};

/**
 * Resolves the single status pill a card should show.
 *
 * A GO, circular, memo or proceeding has no application lifecycle, so it shows
 * its order state (Current / Amended / Superseded / Archived) rather than a
 * recruitment stage — without this gate a DA arrears circular whose statusBadge
 * happens to read "results" displays a green "Results" pill.
 */
export function resolveLifecyclePill(
  post: LifecycleInput,
  recruitment: RecruitmentPill
): { label: string; variant: BadgeVariant } {
  const view = resolveLifecycle(post);

  if (view.kind === "state") {
    return { label: view.label, variant: ORDER_STATE_VARIANT[view.state] };
  }

  return {
    label: recruitment.labels[post.statusBadge] ?? post.statusBadge,
    variant: recruitment.variants[post.statusBadge] ?? recruitment.fallbackVariant,
  };
}

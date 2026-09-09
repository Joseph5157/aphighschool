import type { OrderState } from "@prisma/client";
import { resolveLifecycle, type LifecycleInput } from "@/lib/posts/lifecycle";

export type BadgeVariant = "tamarind" | "turmeric" | "tamarind" | "kumkum" | "neutral";

// The R16 order-state mapping, stated once. OrderStateBadge (the full-width
// detail-page block) and every card surface read it from here.
//
// `superseded` now uses `kumkum`, the Badge variant added in UI-SYSTEM-1. It
// previously used `tamarind` because no red-family variant existed — which put
// a replaced order in the SAME green family as one still in force, the exact
// misreading this mapping exists to prevent. A user who acts on a superseded
// order is materially harmed, so it earns the warning colour; `archived` stays
// neutral because it is merely historical with no successor to redirect to.
export const ORDER_STATE_VARIANT: Record<OrderState, BadgeVariant> = {
  current: "tamarind",
  amended: "turmeric",
  superseded: "kumkum",
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

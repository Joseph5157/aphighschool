import type { DocType, OrderState } from "@prisma/client";

export const RECRUITMENT_STAGES = ["Notified", "Apply open", "Hall ticket", "Results"];

const STAGE_INDEX: Record<string, number> = {
  notification: 1,
  apply_link: 2,
  hall_ticket: 3,
  results: 4,
  expired: 4,
};

const STATE_LABEL: Record<OrderState, string> = {
  current: "Current",
  amended: "Amended",
  superseded: "Superseded",
  archived: "Archived",
};

// Which order states still bind. `amended` counts as in force: an amended order
// is the operative one, read together with its amendment — only `superseded`
// (replaced by a later order) and `archived` (historical record) are spent.
// Written as a total Record so that adding a value to the OrderState enum is a
// compile error here rather than a silent default.
const STATE_IN_FORCE: Record<OrderState, boolean> = {
  current: true,
  amended: true,
  superseded: false,
  archived: false,
};

export type LifecycleView =
  | { kind: "recruitment"; stages: string[]; currentStage: number; isExpired: boolean }
  | { kind: "state"; state: OrderState; label: string; inForce: boolean };

export type LifecycleInput = {
  documentType: DocType | null;
  statusBadge: string;
  orderState: OrderState;
};

// An action deadline is orthogonal to the lifecycle KIND — a recruitment
// notification and a GO that opens an application window (the seeded GO 129)
// can each carry one. It arrives as a string on the RSC serialization boundary.
export type LifecycleFilterInput = LifecycleInput & {
  actionDeadline?: Date | string | null;
};

/**
 * Application stages (hall tickets, results) only make sense for recruitment and
 * examination notifications such as TET and DSC. A GO, circular, memo, or
 * proceeding has no application lifecycle — it is current, amended, superseded,
 * or archived.
 */
export function resolveLifecycle(post: LifecycleInput): LifecycleView {
  if (post.documentType === "notification") {
    return {
      kind: "recruitment",
      stages: RECRUITMENT_STAGES,
      currentStage: STAGE_INDEX[post.statusBadge] ?? 1,
      isExpired: post.statusBadge === "expired",
    };
  }

  return {
    kind: "state",
    state: post.orderState,
    label: STATE_LABEL[post.orderState],
    inForce: STATE_IN_FORCE[post.orderState],
  };
}

/**
 * Is this document finished — the "Closed" half of the category log's
 * Open/Closed filter?
 *
 * "Open" and "Closed" are borrowed from recruitment, where they mean exactly
 * one thing: is the application window still open. A GO is never open or closed
 * in that sense — it is in force or it is not. So the question is answered per
 * lifecycle KIND, through the SAME resolveLifecycle view that produces the pill
 * on the card. That is the whole point: before this, the filter kept its own
 * universal `statusBadge === "expired"` rule while the pill had moved on to
 * documentType, and a row could show a green "Current" pill and still be hidden
 * by the "Open" filter (prisma/seed.ts's GO 21 did exactly that).
 *
 * `actionDeadline` is orthogonal and applies to both kinds: a document whose
 * deadline has passed is finished whatever its kind says.
 */
export function isLifecycleClosed(post: LifecycleFilterInput, now: Date = new Date()): boolean {
  if (post.actionDeadline && new Date(post.actionDeadline) < now) return true;

  const view = resolveLifecycle(post);

  return view.kind === "recruitment" ? view.isExpired : !view.inForce;
}

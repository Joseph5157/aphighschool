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

export type LifecycleView =
  | { kind: "recruitment"; stages: string[]; currentStage: number; isExpired: boolean }
  | { kind: "state"; state: OrderState; label: string };

export type LifecycleInput = {
  documentType: DocType | null;
  statusBadge: string;
  orderState: OrderState;
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
  };
}
